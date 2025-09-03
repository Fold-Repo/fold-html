document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-swiper]").forEach(function (el) {
        var preview = el.getAttribute("data-preview");
        var tablet = el.getAttribute("data-tablet");
        var mobile = el.getAttribute("data-mobile");
        var mobileSm = el.getAttribute("data-mobile-sm") || mobile;

        var spacingLg = el.getAttribute("data-space-lg");
        var spacingMd = el.getAttribute("data-space-md");
        var spacing = el.getAttribute("data-space");

        var perGroup = el.getAttribute("data-pagination") || 1;
        var perGroupMd = el.getAttribute("data-pagination-md") || 1;
        var perGroupLg = el.getAttribute("data-pagination-lg") || 1;

        var loop = el.getAttribute("data-loop") === "true";
        var centered = el.getAttribute("data-centered") === "true";

        var paginationEl = el.getAttribute("data-pagination-el") || ".sw-pagination";
        var nextEl = el.getAttribute("data-next-el") || ".nav-next";
        var prevEl = el.getAttribute("data-prev-el") || ".nav-prev";

        var autoplay = el.getAttribute("data-autoplay") === "true";
        var autoplayDelay = el.getAttribute("data-autoplay-delay") || 3000;
        var autoplayDisableOnInteraction = el.getAttribute("data-autoplay-disable") === "true";

        var autoplayConfig = autoplay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: autoplayDisableOnInteraction,
            }
            : false;

        new Swiper(el, {
            slidesPerView: mobile,
            spaceBetween: spacing,
            speed: 1000,
            pagination: {
                el: paginationEl,
                clickable: true,
            },
            slidesPerGroup: perGroup,
            observer: true,
            centeredSlides: centered,
            observeParents: true,
            navigation: {
                clickable: true,
                nextEl: nextEl,
                prevEl: prevEl,
            },
            loop: loop,
            autoplay: autoplayConfig,
            breakpoints: {
                575: {
                    slidesPerView: mobileSm,
                    spaceBetween: spacing,
                    slidesPerGroup: perGroup,
                },
                768: {
                    slidesPerView: tablet,
                    spaceBetween: spacingMd,
                    slidesPerGroup: perGroupMd,
                },
                1200: {
                    slidesPerView: preview,
                    spaceBetween: spacingLg,
                    slidesPerGroup: perGroupLg,
                },
            },
        });
    });
});
