"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAppSelector, useAppDispatch } from "@/lib/store/hook";
import { store } from "@/lib/store";

import {
  selectGeofenceQueue,
  confirm,
  markShown,
  selectGeofenceShown,
} from "@/lib/store/slices/geofenceSlice";

import { selectNav, fetchUserTourPoints } from "@/lib/store/slices/navSlice";

import { selectTourDetail } from "@/lib/store/slices/touristSlice";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { apiCreateVisitHistory } from "@/services/myListService";
import { apiCreateStamp } from "@/services/userNavService";
import { useLocale } from "@/providers/LocaleProvider";
import { normalizeHTML } from "@/lib/utils";

/* --------------------
    Sanitize HTML
-------------------- */
function sanitizeHTML(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

/* ----------------------------------------------
   GLOBAL CHECK-IN POPUP
---------------------------------------------- */
export default function GlobalCheckinToasts() {
  const dispatch = useAppDispatch();
  const { t: translate } = useLocale();

  const queue = useAppSelector(selectGeofenceQueue);
  const shown = useAppSelector(selectGeofenceShown) || [];

  const nav = useAppSelector(selectNav);
  const tourDetail = useAppSelector(selectTourDetail);
  const auth = useAppSelector((s) => s.auth.data);

  const popupLock = useRef(false);

  /* -------------------------------------------------------
     EFFECT → Opens popup whenever queue has new item
  -------------------------------------------------------- */
  useEffect(() => {
    if (popupLock.current) return;
    if (!queue.length) return;

    const item = queue[0];
    const successText = translate("checked_in_at");
    const failedCheckInText = translate("failed_to_complete_checkin");
    const pleaseTryAgainText = translate("please_try_again");
    const pleaseSignInText = translate("please_signin_to_checkin");
    const nearText = translate("you_are_near");
    const reachedText = translate("reached_check_in_location");
    const latText = translate("lat");
    const longText = translate("long");
    const radiusText = translate("radius");
    const closeText = translate("close");
    const checkInText = translate("check_in");

    if (shown.includes(item.id)) {
      dispatch(confirm(item.id));
      return;
    }

    popupLock.current = true;

    toast.custom(
      (t) =>
        createPortal(
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <div
              className="
      relative w-[90%] max-w-md p-6 rounded-2xl
      shadow-2xl
      text-gray-900 dark:text-gray-100

       /* 🌞 Light mode */
          bg-white
          border border-teal-400/40
          hover:shadow-[0_0_10px_rgba(45,212,191,0.35)]

          /* 🌙 Dark mode */
          dark:bg-black/80
          dark:border-teal-400/40
          dark:hover:shadow-[0_0_12px_rgba(45,212,191,0.55)]
    "
            >
              {/* Title */}
              <h3 className="font-semibold text-lg mb-3 break-words text-teal-800 dark:text-teal-200">
                {nearText}: {item.name}
              </h3>

              {/* Description */}
              {item.blurb ? (
                <div
                  className="
          text-sm mb-4 leading-relaxed
          text-teal-900/80 dark:text-teal-200/80
          prose dark:prose-invert whitespace-pre-wrap
        "
                  dangerouslySetInnerHTML={{
                    __html: normalizeHTML(item.blurb),
                  }}
                />
              ) : (
                <p className="text-sm mb-4 text-teal-700/70 dark:text-teal-300/70">
                  {reachedText}
                </p>
              )}

              {/* Coordinates */}
              <div className="text-xs mb-4 space-y-1 text-left text-teal-700/70 dark:text-teal-300/70">
                <p>
                  <strong>{latText}:</strong> {item.lat?.toFixed(6) ?? "—"}
                </p>
                <p>
                  <strong>{longText}:</strong> {item.lng?.toFixed(6) ?? "—"}
                </p>
                <p>
                  <strong>{radiusText}:</strong> {item.radius ?? "—"} m
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3">
                {/* Close */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer
          text-teal-700 hover:text-teal-800
          dark:text-teal-300 dark:hover:text-teal-200
        "
                  onClick={() => {
                    toast.dismiss(t);
                    dispatch(confirm(item.id));
                    dispatch(markShown(item.id));
                    popupLock.current = false;
                  }}
                >
                  {closeText}
                </Button>

                {/* CHECK-IN BUTTON */}
                <Button
                  size="sm"
                  className="cursor-pointer
          bg-gradient-to-r
          from-teal-400 via-teal-500 to-teal-600
          text-white
          hover:opacity-95
          shadow-md
        "
                  onClick={async () => {
                    /* 🔥 LOGIC UNCHANGED */
                    try {
                      const userId =
                        auth?.user?._id ||
                        auth?.user?.id ||
                        auth?.user?.uuid ||
                        null;

                      if (!userId) {
                        toast.error(pleaseSignInText);
                        toast.dismiss(t);
                        return;
                      }

                      await apiCreateVisitHistory({
                        user: userId,
                        historytype: "monument",
                        monument: String(item.monumentId),
                        status: "active",
                        visitmode: "manual",
                        historytime: Date.now().toString(),
                      });

                      if (item.monumentId && item.tourpointId) {
                        await apiCreateStamp({
                          monument: String(item.monumentId),
                          tourpoint: String(item.tourpointId),
                          user: String(userId),
                          status: "active",
                          stamptime: Date.now(),
                        });
                      }

                      try {
                        await new Promise((res) => setTimeout(res, 50));

                        const state = store.getState();
                        const freshNav = state.nav;
                        const freshTour = state.tourist.detail;

                        const usertourId =
                          freshNav.usertour?._id || nav.usertour?._id;

                        const tourId = freshTour?._id || tourDetail?._id;

                        if (usertourId && tourId) {
                          await dispatch(
                            fetchUserTourPoints({ tourId, usertourId })
                          ).unwrap();
                        }
                      } catch { }

                      dispatch(confirm(item.id));
                      dispatch(markShown(item.id));
                      toast.dismiss(t);
                      toast.success(`${successText} ${item.name}`);
                    } catch (err: any) {
                      toast.error(failedCheckInText, {
                        description: err?.message || pleaseTryAgainText,
                      });
                    }

                    popupLock.current = false;
                  }}
                >
                  {checkInText}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        ),
      { id: `checkin-${item.id}`, duration: Infinity }
    );
  }, [queue, shown]); // 👈 cleaned deps (no stale refs)

  return null;
}
