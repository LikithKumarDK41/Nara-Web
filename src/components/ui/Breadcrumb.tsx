import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    const { t } = useLocale();

    return (
        <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
            <ol className="flex items-center gap-2 flex-wrap bg-transparent py-1.5">
                {/* Home Icon */}
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-1 text-slate-600 hover:text-teal-600 dark:text-white dark:hover:text-teal-400 transition-colors"
                        title={t("nav.home") || "Home"}
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {/* Items */}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    if (item.href) {
                        return (
                            <li key={index} className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-300 flex-shrink-0" />
                                <Link
                                    href={item.href}
                                    className={`transition-colors whitespace-nowrap ${isLast
                                        ? "font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200"
                                        : "text-slate-600 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                                        }`}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    }

                    return (
                        <li key={index} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-300 flex-shrink-0" />
                            <span
                                className={`whitespace-nowrap ${isLast
                                    ? "font-semibold text-slate-900 dark:text-slate-100"
                                    : "text-slate-600 dark:text-slate-400"
                                    }`}
                                aria-current={isLast ? "page" : undefined}
                            >
                                {item.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
