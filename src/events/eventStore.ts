```typescript
import type { CampusEvent, AssetType } from "@/types/campusos";
import { v4 as uuidv4 } from 'uuid';

const EVENTS_KEY = "campusos_events";

export function getEvents(): CampusEvent[] {
    try {
        const raw = localStorage.getItem(EVENTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function getEventById(id: string): CampusEvent | null {
    const events = getEvents();
    return events.find((e) => e.id === id)?? null;
}

export function saveEvent(event: CampusEvent): void {
    try {
        let events = getEvents();
        const idx = events.findIndex((e) => e.id === event.id);
        if (idx >= 0) {
            events[idx] = event;
        } else {
            events = [event,...events.slice(0, 49)];
        }
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
        // localStorage might be full
    }
}

export function updateEventAssets(
    eventId: string,
    assetType: AssetType,
    assetId: string
): void {
    let events = getEvents();
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

export function deleteEvent(id: string): void {
    try {
        const events = getEvents().filter((e) => e.id!== id);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
        // ignore
    }
}

export function clearAllEvents(): void {
    try {
        localStorage.removeItem(EVENTS_KEY);
    } catch {
        // ignore
    }
}

export function createBlankEvent(overrides?: Partial<CampusEvent>): CampusEvent {
    return {
        id: uuidv4(),
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
```