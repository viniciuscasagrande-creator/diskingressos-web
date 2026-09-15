# Fase 26.16.4 — Customer 360 Operacional

Release: `26.16.4-customer-360-operacional-2026-09-04`

Objetivo: transformar o Customer 360 da Fase 26.3 em ferramenta operacional, mantendo isolamento por `producerId + eventId`.

## Entregas
- Busca por nome, CPF, e-mail e telefone.
- Filtro por segmento, check-in e ordenação por score, valor e recência.
- Perfil 360 carregado por endpoint real, não por mock.
- Abas de jornada: visão geral, pedidos, ingressos e check-ins.
- Ações de copiar contato e navegar para Ingressos, Busca Global, SAC e Financeiro.
- Exportação CSV da base filtrada.
- Estados de loading, erro, vazio e perfil carregando.
- Endpoint `GET /api/events/:id/customer-360/profile?key=...` com validação de tenant.
- Playwright e verificador estático específicos.

## Regras de proteção
- Nunca consultar clientes de outra produtora ou evento.
- Não criar dados paralelos ao banco operacional.
- Não remover Estornos, Financeiro, Marketing, SAC ou Central de Eventos.
- Não transformar ações em botões decorativos: navegação deve abrir os módulos reais existentes.
