"use client";

import React, { useRef, useState, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import type { NavigationOptions, PaginationOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export type SwiperBreakpoints = {
  [width: number]: {
    slidesPerView: number;
    spaceBetween: number;
  };
};

type CustomSwiperProps = {
  children: ReactNode;
  showDots?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  customNavigation?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  breakpoints?: SwiperBreakpoints;
  centeredSlides?: boolean;

  /** Custom classes */
  navBtnClassName?: string;
  navWrapperClassName?: string;
  wrapperClassName?: string;
  swiperClassName?: string;
  carouselContainerClassName?: string;
  paginationClassName?: string;

  /** Styling config */
  paginationColor?: string;
  activePaginationColor?: string;
  navigationColor?: string;
  navigationSize?: string;
};

const CustomSwiper: React.FC<CustomSwiperProps> = ({
  children,
  showDots = true,
  loop = false,
  autoplay = false,
  customNavigation = false,
  navigation = false,
  pagination = true,
  slidesPerView = 3,
  spaceBetween = 10,
  breakpoints,
  centeredSlides = false,

  /** Class props */
  navBtnClassName = "",
  navWrapperClassName = "",
  wrapperClassName = "",
  swiperClassName = "",
  carouselContainerClassName = "",
  paginationClassName = "",

  /** Style props */
  paginationColor = "#ccc",
  activePaginationColor = "#fdc700",
  navigationColor = "#ff0000",
  navigationSize = "30px",
}) => {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null); // ✅ Correct Swiper instance type

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const initCustomNavigation = (
    swiper: SwiperType,
    prev: HTMLElement | null,
    next: HTMLElement | null,
  ) => {
    if (!swiper?.params?.navigation || !prev || !next) return;
    swiper.params.navigation = {
      ...(swiper.params.navigation as NavigationOptions),
      prevEl: prev,
      nextEl: next,
    };
    swiper.navigation.init();
    swiper.navigation.update();
  };

  const initCustomPagination = (
    swiper: SwiperType,
    paginationEl: HTMLElement | null,
  ) => {
    if (!swiper?.params?.pagination || !paginationEl) return;
    swiper.params.pagination = {
      ...(swiper.params.pagination as PaginationOptions),
      el: paginationEl,
    };
    swiper.pagination.init();
    swiper.pagination.update();
  };

  return (
    <div className={`relative flex items-center gap-2 ${wrapperClassName}`}>
      {/* Inject dynamic styles for pagination */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: ${paginationColor} !important;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background-color: ${activePaginationColor} !important;
        }
      `}</style>

      {/* Navigation Buttons */}
      {customNavigation && (
        <div
          className={`${
            navWrapperClassName
              ? navWrapperClassName
              : "flex items-center gap-2 pointer-events-none"
          }`}
        >
          <button
            ref={prevRef}
            className={`${
              navBtnClassName
                ? navBtnClassName
                : "p-2 rounded-full cursor-pointer bg-gray-100 shadow hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto"
            }`}
            disabled={!loop && isBeginning}
          >
            <MoveLeftIcon size={18} />
          </button>

          <button
            ref={nextRef}
            className={`${
              navBtnClassName
                ? navBtnClassName
                : "p-2 rounded-full cursor-pointer bg-gray-100 shadow hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto"
            }`}
            disabled={!loop && isEnd}
          >
            <MoveRightIcon size={18} />
          </button>
        </div>
      )}

      {/* Swiper Container */}
      <div
        className={`relative ${
          carouselContainerClassName ? carouselContainerClassName : "w-full"
        }`}
      >
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          loop={loop}
          autoplay={autoplay || false}
          slidesPerView={slidesPerView}
          spaceBetween={spaceBetween}
          breakpoints={breakpoints}
          centeredSlides={centeredSlides}
          pagination={
            pagination && showDots
              ? { clickable: true, el: paginationRef.current }
              : false
          }
          navigation={
            customNavigation
              ? {
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }
              : navigation
          }
          className={`${swiperClassName}`}
          style={
            {
              "--swiper-navigation-color": navigationColor,
              "--swiper-navigation-size": navigationSize,
            } as React.CSSProperties
          }
          onInit={(swiper: SwiperType) => {
            swiperRef.current = swiper; // ✅ Assign properly typed swiper instance
            if (customNavigation)
              initCustomNavigation(swiper, prevRef.current, nextRef.current);
            if (pagination && showDots)
              initCustomPagination(swiper, paginationRef.current);
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper: SwiperType) => {
            setIsBeginning(!loop ? swiper.isBeginning : swiper.realIndex === 0);
            setIsEnd(
              !loop
                ? swiper.isEnd
                : swiper.realIndex === swiper.slides.length - 1,
            );
          }}
        >
          {React.Children.map(children, (child, index) => (
            <SwiperSlide key={index} className="flex! justify-center">
              {child}
            </SwiperSlide>
          ))}
        </Swiper>

        {showDots && (
          <div
            ref={paginationRef}
            className={`absolute -bottom-4 left-0 right-0 flex justify-center ${paginationClassName}`}
          ></div>
        )}
      </div>
    </div>
  );
};

export default CustomSwiper;
