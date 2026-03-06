"use client";

import { useAppSelector } from "@/lib/store/hook";
import { selectActiveThemeId } from "@/lib/store/slices/globalSlice";
import CategoryContent from "./CategoryContent";

export default function CategoryExplorer() {
  const activeThemeId = useAppSelector(selectActiveThemeId);

  return (
    <main className="w-full">
      <CategoryContent themeId={activeThemeId} hideHero={false} />
    </main>
  );
}
