---
description: Crea un git worktree aislado y ejecuta el requerimiento dado dentro de él
---

Requerimiento del usuario: $ARGUMENTS

Pasos a seguir:

1. A partir del requerimiento, deriva un nombre corto en kebab-case (2-4 palabras, sin acentos, describe la feature/fix) para usar como `[nombre]` del worktree.
2. Verifica con `git worktree list` y `ls .trees/` que el nombre no colisione; si colisiona, agrega sufijo numérico.
3. Crea una rama y el worktree:
   ```
   git worktree add .trees/[nombre] -b [nombre]
   ```
   Si `.trees/` no existe, créala implícitamente (git worktree add la crea).
4. Cambia el contexto de trabajo a ese worktree (usa la herramienta EnterWorktree si está disponible, o trabaja explícitamente con rutas dentro de `.trees/[nombre]/`).
5. Ejecuta el requerimiento del usuario completo dentro de ese worktree, de forma aislada del código principal — no modifiques archivos fuera de `.trees/[nombre]/`.
6. Al terminar, reporta: nombre del worktree, rama creada, y resumen breve de los cambios hechos dentro de él.
