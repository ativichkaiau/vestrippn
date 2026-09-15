# W85 livery collection

The picker groups liveries by Mercedes, Williams, Red Bull, and driver tributes. Palette data, preview stripes, display names, and historical metadata live in `lib/liveries.ts`. The CSS in `app/liveries.css` maps those palettes onto the W85, W10, W09, and hub tokens used throughout the app.

## Mercedes lighting

Silver Arrow takes its brushed silver and teal from the 2014 Mercedes W05. Choose Auto, Day, Twilight, or Night. Auto calculates solar elevation for Chiang Mai (18.7883 N, 98.9853 E); it needs no location permission, weather service, or network connection. It fades silver through graphite between 6 degrees above and 6 degrees below the horizon, reverses the transition at sunrise, and keeps the existing black palette after dark.

The same self-contained engine runs before first paint and after hydration. One controller refreshes the palette every 30 seconds while a visible page uses Auto, when a page becomes visible, and when another tab changes the selection. Text and accents maintain at least 4.5:1 contrast against the four main surfaces throughout the fade. Reduced motion and low power suppress decorative movement and palette transitions.

Other liveries keep their characteristic light or dark bodywork. For example, Martini, Suzuka, and porcelain stay white when the Mercedes mode is Night.

## Collection

| Collection | Editions |
| --- | --- |
| Mercedes | Silver Arrow, 2014 W05 |
| Williams | Canon 1993 FW15C; Williams Heritage 1996 FW18; BMW 2001 FW23; Martini 2014 FW36 |
| Red Bull | Infiniti 2013 RB9; Aston Martin 2020 RB16; Oracle 2022–25; Red Bull Ford 2026 RB22 |
| Red Bull specials | Suzuka 2025 white tribute; Verstappen / Netherlands 2026 Dutch GP tribute; Dutch porcelain original |
| Drivers | Existing Senna helmet tribute |

The Netherlands entry preserves the app's existing Verstappen orange, red, white, and blue design. It is labelled a **Dutch GP tribute**, not an official 2026 race-car reproduction. Dutch porcelain is an original blue-and-white floral design. Sponsor and team names identify the historical references; the interface designs are interpretations.

Ferrari, Force India, McLaren, Benetton, Lotus/JPS, and Alpine are removed from the collection. Existing saved selections for those entries migrate to Mercedes. `monza` migrates to `williams-1996`, and `verstappen` to `redbull-dutch-2026`. Both browser preferences and device-sync/backup validation accept these legacy identifiers, including older backups. New values always use the canonical identifiers.

## References

- [Mercedes: The Silver Arrows story, W05](https://www.mercedesamgf1.com/news/the-silver-arrows-story-mercedes-w05)
- [Red Bull: 2026 livery launch](https://www.redbull.com/int-en/oracle-red-bull-racing-2026-f1-livery-launch) — glossy racing blue and white accents.
- [Honda: 2020 Aston Martin Red Bull RB16](https://hondanews.eu/eu/en/cars/media/pressreleases/200703/aston-martin-red-bull-racing-unveil-the-new-rb16-5)
- [Honda: Suzuka 2025 white livery announcement](https://global.honda/content/dam/site/global-en/topics-new/cq_img/2025/c_2025-04-01eng/c_2025-04-01eng.pdf)
- [NOAA solar-position equations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)

## Validation

`npm run validate:themes` checks the collection, old-preference migration, device-sync compatibility, manual and automatic lighting, minute-by-minute dawn and dusk across the year, palette contrast, blocked browser storage, and parity between the pre-paint script and runtime engine. CI runs it alongside TypeScript and the clinical-case and exam-coverage validators.
