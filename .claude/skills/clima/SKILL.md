---
name: clima
description: Consulta clima actual/pronóstico de ubicación local o ciudad dada. Usar cuando usuario pida clima, temperatura, pronóstico, lluvia, "qué clima hace", "/clima".
---

# Clima

Obtiene clima vía `wttr.in` (sin API key, sin login).

## Uso

1. Si usuario no da ciudad, usar por defecto `Queretaro,Mexico`.
2. Comando base, formato compacto:

```bash
curl -s "wttr.in/{CIUDAD}?format=%l:+%c+%t+(sensación+%f)+%h+humedad+%w+viento&M"
```

Sin ciudad (default Querétaro):

```bash
curl -s "wttr.in/Queretaro,Mexico?format=%l:+%c+%t+(sensación+%f)+%h+humedad+%w+viento&M"
```

3. Pronóstico 3 días, texto plano (default Querétaro si no dan ciudad):

```bash
curl -s "wttr.in/{CIUDAD:-Queretaro,Mexico}?M&F"
```

(agregar `T` si terminal no soporta color: `wttr.in/{CIUDAD}?MFT`)

4. Si `curl` falla (sin red, timeout), avisar a usuario en vez de inventar dato.

## Notas

- `{CIUDAD}` con espacio: usar `+` (ej: `Buenos+Aires`).
- `&M` fuerza unidades métricas (°C, km/h).
- No requiere API key ni configuración.
