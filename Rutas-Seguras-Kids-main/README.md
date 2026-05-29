# 🚌 Rutas Seguras Kids - Panel de Control Escolar 

Bienvenido al sistema frontend de **Rutas Seguras Kids** Muestra cómo construir una aplicación web interactiva, moderna y premium utilizando **únicamente tecnologías web nativas (Vanilla HTML, CSS y JavaScript)**, sin frameworks ni librerías externas.

---

## 🌟 Características Destacadas

*   **Código limpio de HTML5 semántico, CSS3 moderno con variables y JavaScript nativo.
*   **Diseño Monolítico y Ordenado**: Todo el JavaScript (Clima, Web Component y control de la App) está consolidado en `js/app.js`, ideal para una rápida presentación y despliegue escolar.
*   **Web Components encapsulados**: Implementación de una etiqueta HTML personalizada (`<route-card>`) mediante la API de Web Components con **Shadow DOM**, protegiendo sus estilos de interferencias externas.
*   **Eventos Personalizados (`CustomEvent`)**: Demuestra el flujo de datos "Hijo a Padre" comunicando las acciones que ocurren dentro de las tarjetas hacia la aplicación principal usando burbujeo de eventos.
*   **Consumo de API Asíncrona (Async/Await & Fetch)**: Integra el clima operativo de ciudades a través de la API pública de **Open-Meteo**, lo cual demuestra consumo de APIs en vivo sin necesidad de claves de acceso privadas (API keys).
*   **Persistencia en Cliente**: Uso de `localStorage` para guardar el estado de las rutas y estudiantes de forma que no se pierdan al actualizar la página.

---

## 📁 Estructura del Proyecto


rutas-seguras-kids/
├── index.html               # Estructura HTML5 base y punto de entrada
├── css/
│   └── styles.css           # Estilos, variables y breakpoints responsivos
├── js/
│   └── app.js               # Clima, Web Component y control de estado
└── README.md                # Documentación del proyecto 



## 🚀 Instrucciones de Ejecución


Para ejecutarlo localmente en **Visual Studio Code**, sigue uno de estos sencillos métodos:

### Método Recomendado (Extensión Live Server)
1.  Abre Visual Studio Code y añade la carpeta `rutas-seguras-kids` a tu espacio de trabajo.
2.  Instala la extensión **Live Server** desde el mercado de extensiones de VS Code.
3.  Una vez instalada, haz clic derecho sobre el archivo `index.html` en el explorador de archivos y selecciona **"Open with Live Server"** (o presiona el botón "Go Live" en la esquina inferior derecha).
4.  La aplicación se abrirá automáticamente en tu navegador bajo la dirección `http://127.0.0.1:5500/index.html`.





## 🛠️ ¿Cómo Funciona el Código? (Explicación Pedagógica)

### 1. El Script Consolidado (`js/app.js`)
Para cumplir con la directiva de mínima extensión e igual funcionalidad, agrupamos las 3 piezas clave:
*   **Clima Asíncrono**: Consulta a Open-Meteo las coordenadas de la ciudad seleccionada con un solo `fetch` simplificado.
*   **Web Component `<route-card>`**: Declarado con Shadow DOM. Renderiza dinámicamente la información de la ruta y su lista de estudiantes.
*   **Orquestador de Estado**: Maneja los eventos de envío del formulario único (que se adapta automáticamente entre el modo crear y editar) y escucha los `CustomEvent`
