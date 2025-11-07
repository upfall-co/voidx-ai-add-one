"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";

export default function GestureTutorial({
  step,
  isOpen,
}: {
  step: number;
  isOpen: boolean;
}) {
  const variants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
  };

  const RightSwipeAction: Variants = {
    initial: {
      right: 0,
    },
    animate: {
      right: 180,
      opacity: 0,
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "easeIn",
        repeatDelay: 1.0,
      },
    },
  };

  const TopSwipeAction: Variants = {
    initial: {
      bottom: 0,
    },
    animate: {
      bottom: 180,
      opacity: 0,
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "easeIn",
        repeatDelay: 1.0,
      },
    },
  };

  const showTutorial = isOpen && (step === 0 || step === 2);

  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          key="gesture-tutorial-wrapper"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 z-20 w-full h-full bg-[#2c2c2c]/70 rounded-2xl flex flex-col items-center justify-center text-white"
        >
          {step === 0 && (
            <div className="text-center flex flex-col items-center justify-center w-full h-full gap-4">
              <div className="relative h-16 w-3/4">
                <motion.div
                  className="absolute bottom-1/2 transform translate-y-8/9 z-1"
                  variants={RightSwipeAction}
                  initial="initial"
                  animate={isOpen ? "animate" : "initial"}
                >
                  <GestureIcon className="rotate-270" />
                </motion.div>
                <div className="absolute top-1/3 transform -translate-y-1/2 h-1 left-0 right-0 bg-[#d9d9d9]" />
              </div>
              <p className="text-lg mb-2">오른쪽으로 스와이프하세요</p>
            </div>
          )}
          {step === 2 && (
            <div className="text-center flex items-center w-full h-full gap-4">
              <div className="relative h-3/4 w-16">
                <motion.div
                  className="absolute bottom-0 right-0 w-14 h-14 z-1"
                  variants={TopSwipeAction}
                  initial="initial"
                  animate={isOpen ? "animate" : "initial"}
                >
                  <GestureIcon />
                </motion.div>
                <div className="absolute right-0 w-1 top-0 bottom-0 bg-[#d9d9d9]" />
              </div>
              <p className="text-lg mb-2">위로 스와이프하세요</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type GestureIconProps = {
  className?: string;
};

export const GestureIcon = ({ className }: GestureIconProps) => {
  return (
    <svg
      className={className}
      width="56"
      height="41"
      viewBox="0 0 56 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M41.6844 21.3859C43.1961 21.3858 44.1659 20.1982 44.1659 19.0612C44.1657 17.9246 43.1959 16.7366 41.6844 16.7365L17.1529 16.7365C16.5618 16.7365 16.0122 16.4056 15.699 15.8605C15.386 15.3154 15.3539 14.6337 15.6131 14.0562L18.7406 7.08934C18.7807 7.00025 18.8265 6.91437 18.879 6.83333C19.4323 5.97969 19.2823 4.86265 18.4238 4.20042C17.5595 3.53395 16.4778 3.57737 15.6667 4.29506L15.6611 4.29991C15.6457 4.31402 15.6224 4.3349 15.5919 4.363C15.5305 4.4197 15.4392 4.50489 15.3219 4.61416C15.0874 4.83268 14.7481 5.15001 14.3333 5.54478C13.5026 6.33541 12.3708 7.43211 11.1645 8.65574C8.694 11.1618 6.10236 14.0136 5.00316 15.8787C4.0319 17.5267 3.42322 20.6812 3.42767 24.0006C3.42986 25.6151 3.57797 27.1643 3.85613 28.4584C4.14325 29.7939 4.5306 30.6788 4.89268 31.1338C5.92662 32.4327 7.75689 33.8191 10.0487 34.9667C12.3177 36.1027 14.9021 36.9349 17.3392 37.2246C20.948 37.6535 24.08 35.223 24.7145 31.9661L26.4875 22.8638C26.6552 22.0025 27.3549 21.386 28.1645 21.3859L41.6844 21.3859ZM29.5548 25.1133L28.0685 32.739C27.0231 38.1049 22.096 41.5398 16.9665 40.9301C14.1174 40.5914 11.176 39.6342 8.61493 38.3518C6.07668 37.0809 3.77109 35.42 2.30071 33.5725C1.41075 32.4543 0.859026 30.89 0.518828 29.3077C0.169755 27.684 0.00253137 25.8449 2.89914e-05 24.0067C-0.00483395 20.4202 0.620827 16.4083 2.11776 13.8682C3.4868 11.5451 6.40413 8.38718 8.8258 5.93062C10.0657 4.6729 11.2265 3.54942 12.0761 2.74079C12.501 2.33635 12.8488 2.00952 13.0914 1.78348C13.2125 1.67073 13.3076 1.58267 13.3726 1.52261C13.405 1.49278 13.4303 1.46919 13.4474 1.45345C13.4559 1.44561 13.4629 1.43942 13.4675 1.43525C13.4698 1.43317 13.473 1.4304 13.473 1.4304L13.4742 1.42919L14.5788 2.85363L13.4753 1.42797C13.4819 1.42196 13.4887 1.41568 13.4954 1.40977C15.5039 -0.37323 18.287 -0.474746 20.4076 1.16104C22.7319 2.95423 23.321 6.28647 21.7722 8.8341L19.8977 13.0091L41.6844 13.0091C44.8069 13.0093 47.5934 15.5722 47.5936 19.0612C47.5936 22.5508 44.807 25.1131 41.6844 25.1133L29.5548 25.1133Z"
        fill="white"
      />

      <path
        d="M54.0762 3.72733C54.987 3.72733 56 4.56172 56 5.59099L55.8896 32.9247C55.8896 33.954 54.8761 34.7884 53.9653 34.7884C53.0545 34.7884 52.041 33.954 52.041 32.9247L52.1523 5.59099C52.1523 4.56172 53.1653 3.72733 54.0762 3.72733Z"
        fill="white"
      />
    </svg>
  );
};
