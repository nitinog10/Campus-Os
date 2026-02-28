// ─── Campus Event Store (localStorage CRUD) ──────────────────────────────────

import type { CampusEvent, AssetType } from "@/types/campusos";

const EVENTS_KEY = "campusos_events";

// ─── Read all events ────────────────────────────────────

export function getEvents(): CampusEvent[] {
    try {
        const raw = localStorage.getItem(EVENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// ─── Get single event by ID ────────────────────────────

export function getEventById(id: string): CampusEvent | null {
    const events = getEvents();
    return events.find((e) => e.id === id) ?? null;
}

// ─── Save a new event ───────────────────────────────────

export function saveEvent(event: CampusEvent): void {
    try {
        const events = getEvents();
        // Replace if exists, otherwise prepend
        const idx = events.findIndex((e) => e.id === event.id);
        if (idx >= 0) {
            events[idx] = event;
        } else {
            events.unshift(event);
        }
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 50)));
    } catch {
        // localStorage might be full
    }
}

// ─── Update asset IDs on an event ───────────────────────

export function updateEventAssets(
    eventId: string,
    assetType: AssetType,
    assetId: string
): void {
    const events = getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx < 0) return;

    events[idx] = {
        ...events[idx],
        assets: {
            ...events[idx].assets,
            [assetType]: assetId,
        },
    };

    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
        // ignore
    }
}

// ─── Delete an event ────────────────────────────────────

export function deleteEvent(id: string): void {
    try {
        const events = getEvents().filter((e) => e.id !== id);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
        // ignore
    }
}

// ─── Clear all events ───────────────────────────────────

export function clearAllEvents(): void {
    try {
        localStorage.removeItem(EVENTS_KEY);
    } catch {
        // ignore
    }
}

// ─── Create blank event helper ──────────────────────────

export function createBlankEvent(overrides?: Partial<CampusEvent>): CampusEvent {
    return {
        id: crypto.randomUUID(),
        name: "",
        date: "",
        venue: "",
        organizer: "",
        theme: "",
        description: "",
        createdAt: new Date().toISOString(),
        assets: {},
        ...overrides,
    };
}
