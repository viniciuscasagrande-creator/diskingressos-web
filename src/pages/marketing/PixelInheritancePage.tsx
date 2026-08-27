import React from 'react';
import type { EventItem } from '../../types/event';
import TrackingIntegrationsManager from '../../components/TrackingIntegrationsManager';

interface PixelInheritancePageProps {
  events: EventItem[];
  producerId?: number | null;
  producerName?: string;
  notify?: (msg: string) => void;
}

export const PixelInheritancePage: React.FC<PixelInheritancePageProps> = ({
  events,
  producerId = null,
  notify = () => {},
}) => {
  return (
    <TrackingIntegrationsManager
      producerId={producerId}
      events={events as any}
      notify={notify}
    />
  );
};
