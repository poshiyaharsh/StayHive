import React from 'react';
import { RoomGrid } from '../components/room/RoomGrid';

export const RoomsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room Inventory & Status</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Interactive room matrix across floors, occupancy status, and rapid housekeeping turnaround.
        </p>
      </div>

      <RoomGrid />
    </div>
  );
};
