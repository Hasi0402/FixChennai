package com.fixchennai.repair;

import java.util.Map;

/**
 * Transparent price guide shown BEFORE a customer books.
 * NOTE: the ranges are placeholder values - replace with real Chennai market data.
 */
public final class PriceGuide {
    public record Range(String category, int min, int max, String note) {}

    private static final Map<String, int[]> RANGES = Map.of(
        "WASHING_MACHINE", new int[]{300, 1800},
        "AC", new int[]{400, 3000},
        "REFRIGERATOR", new int[]{400, 2500},
        "TV", new int[]{300, 2000},
        "PLUMBING", new int[]{200, 1500},
        "ELECTRICAL", new int[]{150, 1200},
        "WATER_PURIFIER", new int[]{200, 1500});

    private PriceGuide() {}

    public static Range forCategory(String category) {
        int[] r = RANGES.get(category.toUpperCase());
        if (r == null) return new Range(category, 0, 0, "No guide available - ask for a written quote");
        return new Range(category, r[0], r[1], "Typical labour range excluding spare parts");
    }
}
