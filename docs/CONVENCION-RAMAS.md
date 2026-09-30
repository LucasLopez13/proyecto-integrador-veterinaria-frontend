# Guia de Flujo de Trabajo en Git (Git Workflow)

Este documento establece los lineamientos para la creacion de ramas, mensajes de commit y el flujo de integracion en el proyecto.

---

## 1. Estructura de Ramas

* **main (PROTEGIDA)**:
  - Contiene exclusivamente codigo en estado de produccion y entregas estables.
  - No se permite hacer push directo a main.
  - Solo recibe codigo probado mediante integracion desde develop.

* **develop**:
  - Rama base de integracion y desarrollo continuo.
  - Todas las ramas de trabajo nacen desde develop y se mergean nuevamente en develop.

* **Ramas de trabajo temporales**:
  - Se crean a partir de develop actualizado y se eliminan una vez integradas.

---

## 2. Nomenclatura de Ramas

Se utilizan nombres en minusculas separados por guiones (kebab-case):

- `feature/<nombre-funcionalidad>`
- `fix/<nombre-error>`

### Ejemplos reales:
- `feature/autenticacion-vistas-turno`
- `feature/mejoras-visuales-mascotas`
- `feature/conectando-endpoint-mascotas`
- `feature/conexion-backend`

---

## 3. Formato de Mensajes de Commit

Los commits siguen el formato con prefijo de tipo, fecha en formato dia/mes (DDMM) y descripcion:

```text
tipo/DDMM/descripcion del cambio
```

### Tipos comunes:
- **feat**: Nueva funcionalidad o vistas agregadas.
- **fix**: Correccion de errores o problemas visuales.
- **refactor**: Cambios de codigo o componentes sin alterar la funcionalidad.
- **docs**: Modificaciones o agregado de documentacion.

### Ejemplos reales:
- `feat/2909/integrar solicitud, listado y gestion de turnos con autenticacion`
- `feat/2909/Se agrego validaciones para el turno de mascotas, fecha y hora, ademas se impementaron mejoras visuales en los detalles de la Mascota y el formulario de turno`
- `feat/2909/Se conecto con el endpoint de registrar mascota`
- `feat/2909/Se conecto el frontend con el backend`
- `docs/2909/agregar guia de ramas y commits en frontend`

---

## 4. Flujo de Trabajo Paso a Paso

### Paso 1: Actualizar siempre develop
Antes de comenzar cualquier nueva tarea, descargar los ultimos cambios de la rama develop:
```bash
git switch develop
git pull origin develop
```

### Paso 2: Crear la rama para la funcionalidad
Crear y posicionarse en la nueva rama a partir de develop:
```bash
git switch -c feature/nombre-de-la-funcionalidad
```

### Paso 3: Desarrollar y realizar commits
Realizar los cambios necesarios y commitear siguiendo el formato:
```bash
git add .
git commit -m "feat/2909/descripcion clara de lo implementado"
```

### Paso 4: Preparar la integracion
Una vez finalizada y probada la funcionalidad:
1. Volver a la rama develop:
   ```bash
   git switch develop
   ```
2. Asegurar que develop este al dia con el repositorio remoto:
   ```bash
   git pull origin develop
   ```

### Paso 5: Mergear la rama en develop
Integrar los cambios de la funcionalidad en develop:
```bash
git merge feature/nombre-de-la-funcionalidad
```

### Paso 6: Subir los cambios a GitHub
Publicar la rama develop actualizada en el repositorio remoto:
```bash
git push origin develop
```

---

## 5. Reglas Principales

1. No hacer push directo a main bajo ninguna circunstancia.
2. Hacer siempre git pull origin develop antes de crear una rama y antes de hacer el merge.
3. Desarrollar y probar toda la funcionalidad completa en su rama antes de mergear en develop.
