using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly ReporteData _data;

        public ReportesController(ReporteData data)
        {
            _data = data;
        }

        // GET: api/Reportes - Obtener todos los reportes activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Reportes/{id} - Obtener un reporte por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var reporte = await _data.ObtenerId(id);
            if (reporte == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Reporte no encontrado" });
            }
            return Ok(reporte);
        }

        // POST: api/Reportes - Crear un reporte
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Reporte reporte)
        {
            if (reporte == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(reporte);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Reporte creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el reporte" });
        }

        // PUT: api/Reportes - Editar un reporte
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Reporte reporte)
        {
            if (reporte == null || reporte.IdReporte == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var reporteExistente = await _data.ObtenerId(reporte.IdReporte);
            if (reporteExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Reporte no encontrado" });
            }

            bool respuesta = await _data.Editar(reporte);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Reporte actualizado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el reporte, pero existe" });
        }

        // DELETE: api/Reportes/{id} - Eliminación lógica de un reporte
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var reporteExistente = await _data.ObtenerId(id);
            if (reporteExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Reporte no encontrado" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Reporte desactivado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el reporte, pero existe" });
        }
    }
}