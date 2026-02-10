"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/lib/store/hook";
import { useLocale } from "@/providers/LocaleProvider";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const authData = useAppSelector((s) => s.auth.data);
  const isLoggedIn = !!authData?.user;
  const {t} = useLocale();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-0 sm:inset-auto sm:bottom-24 sm:right-4 w-full h-[100dvh] sm:w-[400px] sm:h-[600px] sm:max-h-[80vh]"
          >
            <ChatWindow onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* <motion.button
  onClick={() => setIsOpen(!isOpen)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className={`cursor-pointer fixed bottom-14 right-6 h-11 w-11 
    bg-gradient-to-r from-orange-500 to-pink-500 
    hover:from-orange-600 hover:to-pink-600 
    text-white shadow-lg hover:shadow-xl transition-shadow 
    z-50 flex items-center justify-center
    rotate-45 rounded-lg
    ${isOpen ? "hidden sm:flex" : "flex"}`}
  aria-label={isOpen ? "Close chat" : "Open chat"}
>
  <span className="-rotate-45 flex items-center justify-center">
    {isOpen ? (
      <X className="h-5 w-5 text-white" />
    ) : (
      <MessageCircle className="h-5 w-5 text-white" />
    )}
  </span>
</motion.button> */}

      {isLoggedIn && (
        <DiamondButton
          label={isOpen ? t("close_chat") : t("open_chat")}
          isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <MessageCircle className="h-5 w-5 text-white" />
          )}
        </DiamondButton>
      )}
    </>
  );
}

function DiamondButton({
  children,
  label,
  gradient = "from-orange-500 to-pink-500",
  onClick,
  isOpen = false,
  className = "",
}: any) {
  return (
    <div className="group pointer-events-auto">
      {/* Tooltip */}
      <div
        className={`
          fixed bottom-[3.6rem] right-[4.5rem]
          opacity-0 group-hover:opacity-100
          translate-x-2 group-hover:translate-x-0
          transition-all duration-300 ease-out
          whitespace-nowrap
          flex items-center gap-2
          bg-black/80 backdrop-blur-md
          text-white text-xs font-semibold tracking-wide
          px-3 py-2 rounded-full
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          z-[9999] mr-2
          ${isOpen ? "hidden sm:flex" : "flex"}
        `}
      >
        <span className="h-2 w-2 rounded-full bg-teal-400" />
        {label}
      </div>

      {/* Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          cursor-pointer
          fixed bottom-14 right-6
          h-11 w-11
          bg-gradient-to-r ${gradient}
          hover:brightness-110
          text-white
          shadow-lg hover:shadow-xl
          transition-shadow
          z-[9998]
          flex items-center justify-center
          rotate-45 rounded-lg
          ${isOpen ? "hidden sm:flex" : "flex"}
          ${className}
        `}
        aria-label={label}
      >
        <span className="-rotate-45 flex items-center justify-center">
          {children}
        </span>
      </motion.button>
    </div>
  );
}
