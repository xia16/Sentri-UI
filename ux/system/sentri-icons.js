/* Shared icon registry for the Sentri prototypes. One path vocabulary so every
   app renders the same glyphs; apps keep a local fallback for source-only checks. */
(function(root){
  'use strict';
  const paths={
    more:'M5 12h.01M12 12h.01M19 12h.01',
    monitor:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    treat:'M15 3l6 6M16 4l-4 4M20 8l-4 4M10 6l8 8M11 7l-7 7v6h6l7-7M4 20l-2 2M8 12l3 3M11 9l3 3',
    hospital:'M13 3h8v18h-8M17 3v18M13 7h8M13 17h8M2 12h12M9 8l5 4-5 4',
    profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    chart:'M4 20V10M12 20V4M20 20v-7',
    origin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    back:'M15 5l-7 7 7 7M8 12h13',
    chevron:'M9 5l7 7-7 7',
    close:'M6 6l12 12M18 6L6 18',
    check:'M5 12l4 4L19 6',
    note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    feed:'M3 12h18l-3 7H6zM7 8l1-2 2 1-1 2zM12 5l1-2 2 1-1 2zM15 9l1-2 2 1-1 2z',
    condition:'M12 4v16M4 12h16',
    weight:'M5 6h14l2 15H3zM8 6a4 4 0 0 1 8 0M12 11v4',
    search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',
    grid:'M3 3h7v7H3zM14 3h7v7H3zM3 14h7v7H3zM14 14h7v7H3z',
    scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10',
    clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    alert:'M12 3L2 21h20zM12 9v5M12 17v1',
    signal:'M4 18v-3M9 18v-7M14 18V7M19 18V3',
    battery:'M3 6h16v12H3zM22 10v4M6 9h10v6H6z',
    filter:'M4 5h16l-6 7v6l-4 2v-8z',
    minus:'M5 12h14',
    plus:'M5 12h14M12 5v14',
    record:'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
    camera:'M3 7h4l2-3h6l2 3h4v14H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    edit:'M4 20l4-1L20 7l-4-4L4 15zM13 6l4 4',
    wrench:'M14 3a6 6 0 0 0-7 8L2 16a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-4 4-3-3 4-4z',
    details:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    calendar:'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16',
    bookmark:'M6 3h12v18l-6-4-6 4z',
    transfer:'M7 7h11l-3-3M18 7l-3 3M17 17H6l3-3M6 17l3 3',
    down:'m6 9 6 6 6-6',
    arrow:'m9 5 7 7-7 7',
    place:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    home:'m3 10 9-7 9 7v11h-6v-7H9v7H3z',
    toolbox:'M3 8h18v12H3zM8 8V4h8v4M3 13h18M10 12v3h4v-3',
    spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z',
    heat:'M12 3c1 5-4 5-4 9 0 2 2 3 3 3-1-3 3-4 3-7 4 4 6 7 4 10-2 4-9 4-12 0-3-5 3-10 6-15z',
    pregnancy:'M3 15h4l3-8 4 12 3-7h4M3 4h18',
    farrow:'M3 12h4l3-7 4 14 3-7h4',
    barn:'m3 9 9-6 9 6v12H3zM9 21V11h6v10M3 9h18',
    return:'M4 8h11a6 6 0 0 1 0 12h-3M8 3 3 8l5 5',
    send:'M12 20V4m-6 6 6-6 6 6',
    health:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8M8 12h8M12 8v8',
    temperature:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0M12 8v9',
    humidity:'M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12z',
    air:'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5',
    upload:'M12 16V4m-4 4 4-4 4 4M4 15v6h16v-6',
    offline:'m3 3 18 18M4 9a13 13 0 0 1 2-1M10 6a14 14 0 0 1 10 3M7 13a8 8 0 0 1 3-1M14 12a8 8 0 0 1 3 1M10 17a3 3 0 0 1 4 0M12 21h.01'
  };
  const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.chevron}"/></svg>`;
  const api=Object.freeze({paths:Object.freeze({...paths}),icon});
  root.SentriIcons=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
