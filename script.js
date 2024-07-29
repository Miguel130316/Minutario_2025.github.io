// script.js
// Variables para almacenar los registros
let registros = JSON.parse(localStorage.getItem('registros')) || [];
let registroSeleccionado = null;

// Contadores de folios y registros por página
let folioCounter = JSON.parse(localStorage.getItem('folioCounter')) || 1;
const registrosPorPagina = 5;
let paginaActual = 1;

// Obtener elementos del DOM
const formulario = document.getElementById('registroForm');
const nuevoBtn = document.getElementById('nuevoBtn');
const guardarBtn = document.getElementById('guardarBtn');
const resultadosTabla = document.getElementById('resultadosTabla').getElementsByTagName('tbody')[0];
const buscarInput = document.getElementById('buscar');
const paginacionDiv = document.getElementById('paginacion');
const contadorDiv = document.getElementById('contador');
const loadingDiv = document.getElementById('loading');
const mensajeDiv = document.getElementById('mensaje');
const mensajeGuardadoDiv = document.getElementById('mensajeGuardado');
const generarReporteBtn = document.getElementById('generarReporteBtn');

// Función para mostrar registros en la tabla
function mostrarRegistros() {
    resultadosTabla.innerHTML = '';
    const textoBusqueda = buscarInput.value.toLowerCase();
    const registrosFiltrados = registros.filter(registro => {
        return (
            registro.fechaRecepcion.toLowerCase().includes(textoBusqueda) ||
            registro.numOficio.toLowerCase().includes(textoBusqueda) ||
            registro.nombreSuscribe.toLowerCase().includes(textoBusqueda) ||
            registro.dependenciaDestinataria.toLowerCase().includes(textoBusqueda) ||
            registro.responsable.toLowerCase().includes(textoBusqueda)
        );
    });

    // Calcular índices de paginación
    const indiceInicial = (paginaActual - 1) * registrosPorPagina;
    const indiceFinal = indiceInicial + registrosPorPagina;
    const registrosPagina = registrosFiltrados.slice(indiceInicial, indiceFinal);

    // Mostrar registros en la tabla
    registrosPagina.forEach(registro => {
        const row = resultadosTabla.insertRow();
        row.insertCell().textContent = registro.folio;
        row.insertCell().textContent = registro.fechaEmision;
        row.insertCell().textContent = registro.fechaRecepcion;
        row.insertCell().textContent = registro.numOficio;
        row.insertCell().textContent = registro.nombreSuscribe;
        row.insertCell().textContent = registro.dependenciaDestinataria;
        row.insertCell().textContent = registro.asunto;
        row.insertCell().textContent = registro.responsable;

        const estatusCell = row.insertCell();
        estatusCell.textContent = registro.estatus;
        switch (registro.estatus) {
            case 'ATENDIDO':
                estatusCell.classList.add('estatus-ATENDIDO');
                break;
            case 'PENDIENTE':
                estatusCell.classList.add('estatus-PENDIENTE');
                break;
            case 'VENCIDO':
                estatusCell.classList.add('estatus-VENCIDO');
                break;
            case 'N/P':
                estatusCell.classList.add('estatus-NP');
                break;
        }

        const documentoCell = row.insertCell();
        const link = document.createElement('a');
        link.href = registro.documentoDigital;
        link.textContent = 'Ver documento';
        link.target = '_blank';
        documentoCell.appendChild(link);

        const accionesCell = row.insertCell();
        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.onclick = () => editarRegistro(registro.folio);
        accionesCell.appendChild(editarBtn);

        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.onclick = () => eliminarRegistro(registro.folio);
        accionesCell.appendChild(eliminarBtn);
    });

    // Mostrar paginación
    mostrarPaginacion(registrosFiltrados.length);

    // Actualizar contador
    contadorDiv.textContent = `Mostrando ${registrosPagina.length} de ${registrosFiltrados.length} registros encontrados`;
}

// Función para mostrar paginación
function mostrarPaginacion(totalRegistros) {
    paginacionDiv.innerHTML = '';
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const paginaBtn = document.createElement('button');
        paginaBtn.textContent = i;
        if (i === paginaActual) {
            paginaBtn.disabled = true;
        }
        paginaBtn.onclick = () => {
            paginaActual = i;
            mostrarRegistros();
        };
        paginacionDiv.appendChild(paginaBtn);
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    formulario.reset();
    registroSeleccionado = null;
    formulario.folio.value = '';
}

// Función para guardar un registro
function guardarRegistro() {
    const nuevoRegistro = {
        folio: registroSeleccionado ? registroSeleccionado.folio : folioCounter++,
        fechaEmision: formulario.fechaEmision.value,
        fechaRecepcion: formulario.fechaRecepcion.value,
        numOficio: formulario.numOficio.value,
        nombreSuscribe: formulario.nombreSuscribe.value,
        dependenciaDestinataria: formulario.dependenciaDestinataria.value,
        asunto: formulario.asunto.value,
        responsable: formulario.responsable.value,
        estatus: formulario.estatus.value,
        documentoDigital: formulario.documentoDigital.value
    };

    if (registroSeleccionado) {
        const index = registros.findIndex(reg => reg.folio === registroSeleccionado.folio);
        registros[index] = nuevoRegistro;
    } else {
        registros.push(nuevoRegistro);
    }

    // Guardar registros y contador de folios en localStorage
    localStorage.setItem('registros', JSON.stringify(registros));
    localStorage.setItem('folioCounter', folioCounter);

    limpiarFormulario();
    mostrarRegistros();

    // Mostrar mensaje de confirmación
    mensajeGuardadoDiv.style.display = 'block';
    setTimeout(() => {
        mensajeGuardadoDiv.style.display = 'none';
    }, 3000);
}

// Función para editar un registro
function editarRegistro(folio) {
    registroSeleccionado = registros.find(registro => registro.folio === folio);
    formulario.folio.value = registroSeleccionado.folio;
    formulario.fechaEmision.value = registroSeleccionado.fechaEmision;
    formulario.fechaRecepcion.value = registroSeleccionado.fechaRecepcion;
    formulario.numOficio.value = registroSeleccionado.numOficio;
    formulario.nombreSuscribe.value = registroSeleccionado.nombreSuscribe;
    formulario.dependenciaDestinataria.value = registroSeleccionado.dependenciaDestinataria;
    formulario.asunto.value = registroSeleccionado.asunto;
    formulario.responsable.value = registroSeleccionado.responsable;
    formulario.estatus.value = registroSeleccionado.estatus;
    formulario.documentoDigital.value = registroSeleccionado.documentoDigital;
}

// Función para eliminar un registro
function eliminarRegistro(folio) {
    registros = registros.filter(registro => registro.folio !== folio);

    // Guardar registros actualizados en localStorage
    localStorage.setItem('registros', JSON.stringify(registros));

    mostrarRegistros();
}

// Función para generar el reporte en Excel por RESPONSABLE
function generarReporte() {
    const responsable = formulario.responsable.value;
    const registrosFiltrados = registros.filter(registro => registro.responsable === responsable);

    const ws = XLSX.utils.json_to_sheet(registrosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    loadingDiv.style.display = 'block';

    setTimeout(() => {
        XLSX.writeFile(wb, `reporte_${responsable}.xlsx`);
        loadingDiv.style.display = 'none';
        mensajeDiv.style.display = 'block';
        setTimeout(() => {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }, 2000);
}

// Event listeners
nuevoBtn.addEventListener('click', limpiarFormulario);
guardarBtn.addEventListener('click', guardarRegistro);
buscarInput.addEventListener('input', mostrarRegistros);
generarReporteBtn.addEventListener('click', generarReporte);

// Mostrar registros iniciales
mostrarRegistros();
