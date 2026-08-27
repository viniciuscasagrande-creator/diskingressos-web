import React from 'react';
import type { EventItem } from '../../types/event';
import { EventUtmCentralPage } from './EventUtmCentralPage';

interface UtmLinksPageProps {
  event?: EventItem;
  notify?: (msg: string) => void;
}

export const UtmLinksPage: React.FC<UtmLinksPageProps> = ({ event, notify }) => {
  return <EventUtmCentralPage event={event} notify={notify} />;
};

export { EventUtmCentralPage };
