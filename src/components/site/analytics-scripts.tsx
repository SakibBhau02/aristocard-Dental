import Script from "next/script";
import { getIntegrations } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  AnalyticsScripts — third-party marketing pixels                     */
/*                                                                     */
/*  Async server component rendered once in the root layout. Reads the */
/*  admin-configured integrations (GA4 / GTM / Facebook Pixel / TikTok */
/*  Pixel) and injects the official snippets ONLY for the IDs that     */
/*  have actually been saved. IDs are public by nature (they ship in   */
/*  the page HTML); the Telegram bot token never reaches the browser.  */
/*                                                                     */
/*  Hash-route navigations are mirrored into each pixel by the         */
/*  client tracker (@/lib/tracker) on every route change.              */
/* ------------------------------------------------------------------ */

export async function AnalyticsScripts() {
  const cfg = await getIntegrations();

  return (
    <>
      {cfg.ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${cfg.ga4Id}');`}
          </Script>
        </>
      ) : null}

      {cfg.gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtmId}');`}
        </Script>
      ) : null}

      {cfg.fbPixelId ? (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cfg.fbPixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {cfg.tiktokPixelId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${cfg.tiktokPixelId}');ttq.page();}(window,document,'ttq');`}
        </Script>
      ) : null}
    </>
  );
}
