import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <AppShell>
      <section className="atlas-container">
        <div className="relative overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface shadow-atlas">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(circle at 15% 20%, #e4f0ec 0%, transparent 45%), radial-gradient(circle at 85% 10%, #f8ebd8 0%, transparent 40%), linear-gradient(160deg, #f7faf8 0%, #eef3f0 100%)",
            }}
          />
          <div className="relative grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-16">
            <div className="space-y-5">
              <p className="text-sm font-medium text-atlas-primary">ATLAS</p>
              <h1 className="max-w-xl text-3xl font-bold leading-tight text-atlas-ink sm:text-4xl">
                با مواد موجود، بفهمید چه بپزید — و تا آخر مرحله راهنمایی شوید.
              </h1>
              <p className="max-w-lg text-base leading-8 text-atlas-ink-muted">
                اول مواد را وارد کنید، فیلترهای ساده بزنید، دقیق‌ترین
                پیشنهادها را ببینید، و در حالت پخت بدون حواس‌پرتی جلو بروید.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/ingredients">
                  <Button size="lg">شروع با مواد من</Button>
                </Link>
                <Link href="/recommendations">
                  <Button size="lg" variant="secondary">
                    دیدن پیشنهادها
                  </Button>
                </Link>
              </div>
            </div>
            <div className="atlas-surface space-y-4 bg-white/80 p-5">
              <h2 className="text-sm font-semibold text-atlas-ink">مسیر اصلی</h2>
              <ol className="space-y-3 text-sm leading-7 text-atlas-ink-muted">
                <li>۱. افزودن مواد با تکمیل خودکار فارسی</li>
                <li>۲. فیلتر زمان، وعده، سختی و بودجه</li>
                <li>۳. اولویت با «دقیقاً با مواد من»</li>
                <li>۴. پخت مرحله‌ای با تایمر و کمک فوری</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "کشف مبتنی بر مواد",
              body: "اولویت با تطبیق دقیق، بعد کم‌ترین مادهٔ کم.",
            },
            {
              title: "حالت پخت آرام",
              body: "یک دستور کوتاه در هر مرحله، تایمر، کمک و خروج اختیاری.",
            },
            {
              title: "آماده برای API واقعی",
              body: "قراردادهای مشترک و کلاینت mock؛ رتبه‌بندی سمت سرور می‌ماند.",
            },
          ].map((item) => (
            <article key={item.title} className="atlas-surface p-5">
              <h3 className="font-semibold text-atlas-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-atlas-ink-muted">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
