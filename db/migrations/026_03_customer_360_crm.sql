-- Fase 26.3 — Customer 360 / CRM de Participantes
-- Índices de identidade e jornada. O endpoint agrega as fontes oficiais sem duplicar saldo/pedido.
CREATE INDEX IF NOT EXISTS idx_participant_event_document ON Participant(eventId, document);
CREATE INDEX IF NOT EXISTS idx_participant_event_email ON Participant(eventId, email);
CREATE INDEX IF NOT EXISTS idx_order_event_buyer_email ON `Order`(eventId, buyerEmail);
CREATE INDEX IF NOT EXISTS idx_order_event_buyer_document ON `Order`(eventId, buyerDocument);
