//Inicializar data table
document.addEventListener("DOMContentLoaded", function () {
    $(document).ready(function () {
        $('#tabla-datos-dinamicos').DataTable({
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'copy',
                    className: 'btn btn-secondary'
                },
                {
                    extend: 'excel',
                    className: 'btn btn-secondary'
                },
                {
                    extend: 'pdf',
                    className: 'btn btn-secondary'
                },
                {
                    extend: 'print',
                    className: 'btn btn-secondary'
                }
            ],
            language: {
                "decimal": "",
                "emptyTable": "No hay datos disponibles en la tabla",
                "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                "infoFiltered": "(filtrado de _MAX_ registros en total)",
                "lengthMenu": "Mostrar _MENU_ registros",
                "loadingRecords": "Cargando...",
                "processing": "Procesando...",
                "search": "Buscar:",
                "zeroRecords": "No se encontraron registros coincidentes",
                "paginate": {
                    "first": "Primero",
                    "last": "Último",
                    "next": "Siguiente",
                    "previous": "Anterior"
                },
                "buttons": {
                    "copy": "Copiar",
                    "excel": "Excel",
                    "pdf": "PDF",
                    "print": "Imprimir"
                }
            }
        });
    });
});