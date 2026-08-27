#!/usr/bin/env bash
# Local preview APK for @atlas/mobile (no EAS cloud login required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/apps/mobile"
ANDROID_DIR="$MOBILE/android"
DIST_DIR="${ATLAS_APK_OUT:-$MOBILE/dist}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export EXPO_NO_TELEMETRY="${EXPO_NO_TELEMETRY:-1}"
export CI="${CI:-1}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

CMDTOOLS_URL="${ANDROID_CMDTOOLS_URL:-https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip}"
NDK_VERSION="${ANDROID_NDK_VERSION:-27.1.12297006}"
BUILD_TOOLS_VERSION="${ANDROID_BUILD_TOOLS_VERSION:-36.0.0}"
COMPILE_SDK="${ANDROID_COMPILE_SDK:-36}"
STORE_PASS="${ATLAS_KEYSTORE_PASSWORD:-atlas-preview}"
KEY_ALIAS="${ATLAS_KEY_ALIAS:-atlas}"
KEYSTORE_PATH="${ATLAS_KEYSTORE_PATH:-$ANDROID_HOME/atlas-preview.keystore}"

log() { printf '\n==> %s\n' "$*"; }

ensure_cmdline_tools() {
  if command -v sdkmanager >/dev/null 2>&1; then
    return
  fi
  log "Installing Android command-line tools into $ANDROID_HOME"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  tmp="$(mktemp -d)"
  curl -fsSL "$CMDTOOLS_URL" -o "$tmp/cmdtools.zip"
  unzip -q "$tmp/cmdtools.zip" -d "$tmp"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf "$tmp"
}

ensure_sdk_packages() {
  log "Accepting Android SDK licenses and installing packages"
  mkdir -p "$ANDROID_HOME/licenses"
  yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses >/tmp/android-sdk-licenses.log || true
  sdkmanager --sdk_root="$ANDROID_HOME" --install \
    "platform-tools" \
    "platforms;android-${COMPILE_SDK}" \
    "build-tools;${BUILD_TOOLS_VERSION}" \
    "ndk;${NDK_VERSION}" \
    "cmake;3.22.1"
}

ensure_node_modules() {
  if [[ ! -d "$ROOT/node_modules/expo" && ! -d "$MOBILE/node_modules/expo" ]]; then
    log "Installing npm workspaces"
    (cd "$ROOT" && npm install --legacy-peer-deps)
  fi
}

ensure_prebuild() {
  log "Generating android/ via Expo prebuild"
  (cd "$MOBILE" && npx expo prebuild --platform android --non-interactive --no-install)
}

ensure_keystore() {
  if [[ -f "$KEYSTORE_PATH" ]]; then
    return
  fi
  log "Creating preview signing keystore"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE_PATH" \
    -storepass "$STORE_PASS" \
    -alias "$KEY_ALIAS" \
    -keypass "$STORE_PASS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Atlas Preview, OU=Atlas, O=Atlas, L=Tehran, ST=Tehran, C=IR"
}

assemble_release() {
  log "Assembling signed release APK"
  mkdir -p "$DIST_DIR"
  (
    cd "$ANDROID_DIR"
    ./gradlew :app:assembleRelease \
      --no-daemon \
      -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g" \
      -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
      -Pandroid.injected.signing.store.password="$STORE_PASS" \
      -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
      -Pandroid.injected.signing.key.password="$STORE_PASS"
  )
}

copy_apk() {
  local src
  src="$(find "$ANDROID_DIR/app/build/outputs/apk/release" -name "*.apk" | head -n 1)"
  if [[ -z "$src" ]]; then
    echo "Release APK not found under $ANDROID_DIR/app/build/outputs/apk/release" >&2
    exit 1
  fi
  local dest="$DIST_DIR/smart-chef-preview.apk"
  cp -f "$src" "$dest"
  sha256sum "$dest" | tee "$dest.sha256"
  log "APK ready: $dest"
  ls -lh "$dest"
}

ensure_cmdline_tools
ensure_sdk_packages
ensure_node_modules
ensure_prebuild
ensure_keystore
assemble_release
copy_apk
