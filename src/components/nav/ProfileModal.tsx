"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hook";
import {
  deleteAccount,
  logout,
  updateUserProfile,
  uploadProfileImage,
} from "@/lib/store/slices/authSlice";
import { useLocale } from "@/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetAll as resetNav } from "@/lib/store/slices/navSlice";
import { resetAll as resetGeofence } from "@/lib/store/slices/geofenceSlice";
import { clearTourDetail } from "@/lib/store/slices/touristSlice";
import { useGlobalLoader } from "@/providers/LoaderProvider";

export default function ProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data, loading, countries, countriesLoading } = useAppSelector(
    (s) => s.auth,
  );

  const user = data?.user || null;
  const { show, hide } = useGlobalLoader();

  // ------------------------------------
  // FORM STATE (Same fields as Register form)
  // ------------------------------------
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    agegroup: "",
    country: "",
    nationality: "",
    phoneNumber: "",
  });

  // IMAGE STATE
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getCountryCode = (value: any, countries: any[]) => {
    if (!value || !countries?.length) return "";

    // Case 1: Already an object { name, code }
    if (typeof value === "object") {
      return value.code || "";
    }

    // Case 2: Already a valid country code
    const byCode = countries.find((c) => c.code === value);
    if (byCode) return byCode.code;

    // Case 3: Match by country name (string only)
    if (typeof value === "string") {
      const byName = countries.find(
        (c) => c.name.toLowerCase() === value.toLowerCase(),
      );
      return byName?.code || "";
    }

    return "";
  };

  const getCountryLabel = (code: string) => {
    const c = countries?.find((c: any) => c.code === code);
    return c ? `${c.name} (${c.code})` : "";
  };

  // ------------------------------------
  // PREFILL FORM WHEN MODAL OPENS
  // ------------------------------------
  useEffect(() => {
    if (!user || !countries) return;

    // Gender mapping
    const genderMap: any = {
      男性: "male",
      女性: "female",
      その他: "other",
    };

    // Agegroup mapping (backend → select)
    const ageGroupMap: any = {
      "10-20": "10s",
      "20-30": "20s",
      "30-40": "30s",
      "40-50": "40s",
      "50-60": "50s",
      "60-70": "60s",
    };

    const userCountryCode = getCountryCode(user.country, countries);
    const userNationalityCode = getCountryCode(user.nationality, countries);

    setForm({
      name: user?.name || "",
      email: user?.email || "",
      gender: genderMap[user?.gender] || user?.gender || "",
      agegroup: ageGroupMap[user?.agegroup] || user?.agegroup || "",
      country: userCountryCode || "",
      nationality: userNationalityCode || "",
      phoneNumber: user?.phoneNumber || "",
    });

    setPreview(user?.image?.secure_url || user?.image || null);
  }, [user, countries]);

  // ------------------------------------
  // CHANGE HANDLER
  // ------------------------------------
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow ONLY digits and +
    value = value.replace(/[^0-9+]/g, "");

    // Allow + only at the beginning
    if (value.includes("+") && value.indexOf("+") !== 0) {
      value = value.replace(/\+/g, "");
      value = "+" + value;
    }

    setForm((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  const handleImageSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ------------------------------------
  // SAVE PROFILE
  // ------------------------------------
  const handleSave = async () => {
    if (!user?._id) {
      toast.error(t("profile.userNotFound"));
      return;
    }

    const phone = form.phoneNumber.trim();

    if (!phone) {
      toast.error(t("profile.phoneRequired"));
      return;
    }

    if (
      phone.replace(/[^\d]/g, "").length < 7 ||
      phone.replace(/[^\d]/g, "").length > 15
    ) {
      toast.error(t("profile.invalidPhone"));
      return;
    }

    try {
      // Upload image first
      if (imageFile) {
        const fd = new FormData();
        fd.append("_id", user._id); // ✔ backend expects this
        fd.append("image_upload", imageFile); // ✔ backend expects this

        await dispatch(
          uploadProfileImage({
            userId: user._id,
            file: imageFile,
          }),
        ).unwrap();
      }

      // Update user fields
      await dispatch(
        updateUserProfile({
          id: user._id,
          payload: form,
        }),
      ).unwrap();

      toast.success(t("profile.success"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t("profile.error"));
    }
  };

  async function handleConfirmDelete() {
    // ✅ 1. Close BOTH modals immediately
    setShowDeleteConfirm(false); // delete confirmation modal
    onClose(); // profile modal

    // ✅ 2. Start global loader
    show();

    try {
      // ✅ 3. Call delete account API
      const action = await dispatch(deleteAccount());

      if (!deleteAccount.fulfilled.match(action)) {
        throw new Error("Delete failed");
      }

      // ✅ 4. Reset all user-related redux slices
      dispatch(resetNav());
      dispatch(resetGeofence());
      dispatch(clearTourDetail());

      // ✅ 5. Logout auth state
      dispatch(logout());

      toast.success(t("profile.deleteSuccess"));

      // ✅ 6. Redirect LAST
      router.replace("/signin");
    } catch (err) {
      toast.error(t("profile.deleteFailed"));
    } finally {
      // ✅ 7. Stop loader ALWAYS
      hide();
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        {open && (
          <div className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm" />
        )}
        <DialogContent
          showCloseButton={false}
          className="z-50 w-screen md:w-[70%] lg:w-[50%] h-[90vh] md:h-[100vh] bg-background p-0 !max-w-full overflow-hidden"
        >
          <DialogHeader className="flex items-center border-b bg-background py-4 px-8 relative">
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
            <button
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 
               text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
               transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>
          </DialogHeader>

          <div className=" overflow-y-auto px-8 py-6 space-y-10 transition-opacity duration-300">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="relative group w-32 h-32">
                {preview && (
                  <img
                    src={preview}
                    className="w-32 h-32 rounded-full object-cover border border-teal-600 shadow-md transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
                  />
                )}

                {!preview && (
                  <div className="w-32 h-32 rounded-full object-cover border border-teal-600 shadow-md transition-all duration-300 group-hover:brightness-110 group-hover:scale-105" />
                )}
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 
             text-white flex items-center justify-center text-xs cursor-pointer shadow-sm 
             border border-teal-600 transition-all duration-200"
                >
                  <Pencil className="w-4 h-4" />
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.email")}
              </Label>
              <Input
                name="email"
                value={form.email}
                disabled
                className="
          focus-visible:ring-teal-500
          focus-visible:border-0
          border-teal-300 dark:border-teal-600
        "
              />
            </div>

            {/* NAME */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.name")} *
              </Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className="
          focus-visible:ring-teal-500
          focus-visible:border-0
          border-teal-300 dark:border-teal-600
        "
              />
            </div>

            {/* GENDER */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.gender")} *
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v })}
                disabled={loading}
              >
                <SelectTrigger
                  className="
      w-full
      border-teal-300 dark:border-teal-600
      focus:ring-0
      focus-visible:ring-teal-500
      focus-visible:border-0
    "
                >
                  <SelectValue placeholder={t("profile.selectGender")} />
                </SelectTrigger>
                <SelectContent
                  className="
                    border border-teal-500/20
                    bg-background
                    shadow-lg
                  "
                >
                  <SelectItem value="male">
                    {t("profile.gender_male")}
                  </SelectItem>
                  <SelectItem value="female">
                    {t("profile.gender_female")}
                  </SelectItem>
                  <SelectItem value="other">
                    {t("profile.gender_other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AGE GROUP */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.agegroup")} *
              </Label>
              <Select
                value={form.agegroup}
                onValueChange={(v) => setForm({ ...form, agegroup: v })}
                disabled={loading}
              >
                <SelectTrigger
                  className="
      w-full
      border-teal-300 dark:border-teal-600
      focus:ring-0
      focus-visible:ring-teal-500
      focus-visible:border-0
    "
                >
                  <SelectValue placeholder={t("profile.selectAgeGroup")} />
                </SelectTrigger>

                <SelectContent
                  className="
                    border border-teal-500/20
                    bg-background
                    shadow-lg
                  "
                >
                  <SelectItem value="10s">{t("profile.age_10s")}</SelectItem>
                  <SelectItem value="20s">{t("profile.age_20s")}</SelectItem>
                  <SelectItem value="30s">{t("profile.age_30s")}</SelectItem>
                  <SelectItem value="40s">{t("profile.age_40s")}</SelectItem>
                  <SelectItem value="50s">{t("profile.age_50s")}</SelectItem>
                  <SelectItem value="60s">{t("profile.age_60s")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* COUNTRY */}
            {/* COUNTRY */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.country")} *
              </Label>
              <Select
                value={form.country}
                onValueChange={(v) => setForm({ ...form, country: v })}
                disabled={loading || countriesLoading}
              >
                <SelectTrigger
                  className="
      w-full overflow-hidden
      border-teal-300 dark:border-teal-600
      focus:ring-0
      focus-visible:ring-teal-500
      focus-visible:border-0
    "
                >
                  <SelectValue>
                    <span className="block w-full truncate">
                      {form.country
                        ? getCountryLabel(form.country)
                        : t("profile.selectCountry")}{" "}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="
                 border border-teal-500/20
                 bg-background
                 shadow-lg
               "
                >
                  {countries?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate max-w-[220px]">{c.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          ({c.code})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NATIONALITY */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.nationality")} *
              </Label>

              <Select
                value={form.nationality}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    nationality: v,
                  }))
                }
                disabled={loading || countriesLoading}
              >
                <SelectTrigger
                  className="
      w-full overflow-hidden
      border-teal-300 dark:border-teal-600
      focus:ring-0
      focus-visible:ring-teal-500
      focus-visible:border-0
    "
                >
                  <SelectValue>
                    <span className="block w-full truncate">
                      {form.nationality
                        ? getCountryLabel(form.nationality)
                        : t("profile.selectCountry")}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="
                 border border-teal-500/20
                 bg-background
                 shadow-lg
               "
                >
                  {countries?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate max-w-[220px]">{c.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          ({c.code})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* PHONE NUMBER */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                {t("profile.phone")} *
              </Label>

              <Input
                name="phoneNumber"
                type="tel"
                placeholder="+81 90 1234 5678"
                value={form.phoneNumber}
                onChange={handlePhoneChange}
                disabled={loading}
                className="
      focus-visible:ring-teal-500
      focus-visible:border-0
      border-teal-300 dark:border-teal-600
    "
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* SAVE BUTTON */}
              <Button
                variant="outline"
                className="
      w-full cursor-pointer
      text-white
      border-red-500/40
      text-teal-600
      hover:bg-teal-50
      hover:border-red-500
      dark:border-teal-500/30
      dark:text-teal-400
      dark:hover:bg-teal-900/20
      font-medium
      transition
    "
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? t("profile.saving") : t("profile.saveChanges")}
              </Button>

              {/* DELETE PROFILE */}
              <Button
                variant="outline"
                className="
      w-full cursor-pointer
      border-red-500/40
      text-red-600
      hover:bg-red-50
      hover:border-red-500
      dark:border-red-500/30
      dark:text-red-400
      dark:hover:bg-red-900/20
      font-medium
      transition
    "
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                {t("profile.deleteProfile")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {t("profile.confirmDeleteTitle")}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {t("profile.confirmDeleteMessage")}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            {/* Cancel */}
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("profile.cancel")}
            </Button>

            {/* Confirm Delete */}
            <Button
              className="
          bg-red-600 hover:bg-red-700
          text-white cursor-pointer
        "
              onClick={handleConfirmDelete}
            >
              {t("profile.confirmDeleteAction")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
