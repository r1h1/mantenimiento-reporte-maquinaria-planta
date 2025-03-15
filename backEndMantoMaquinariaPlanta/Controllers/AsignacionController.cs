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
    public class AsignacionesController : ControllerBase
    {
        private readonly AsignacionData _data;

        public AsignacionesController(AsignacionData data)
        {
            _data = data;
        }

        // GET: api/Asignaciones - Obtener todas las asignaciones activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Asignaciones/{id} - Obtener una asignación por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var asignacion = await _data.ObtenerId(id);
            if (asignacion == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Asignación no encontrada" });
            }
            return Ok(asignacion);
        }

        // POST: api/Asignaciones - Crear una asignación
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Asignacion asignacion)
        {
            if (asignacion == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(asignacion);
            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Asignación creada exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear la asignación" });
        }

        // PUT: api/Asignaciones - Editar una asignación
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Asignacion asignacion)
        {
            if (asignacion == null || asignacion.IdAsignacion == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.Editar(asignacion);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Asignación actualizada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Asignación no encontrada" });
        }

        // DELETE: api/Asignaciones/{id} - Eliminación lógica de una asignación
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Asignación desactivada correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Asignación no encontrada" });
        }
    }
}
