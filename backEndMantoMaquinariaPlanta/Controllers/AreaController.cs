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
    public class AreasController : ControllerBase
    {
        private readonly AreaData _data;

        public AreasController(AreaData data)
        {
            _data = data;
        }

        // GET: api/Areas - Obtener todas las áreas activas
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Areas/{id} - Obtener un área por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Obtener(int id)
        {
            var area = await _data.ObtenerId(id);
            if (area == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Área no encontrada" });
            }
            return Ok(area);
        }

        // POST: api/Areas - Crear un área
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Area area)
        {
            if (area == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(area);
            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Área creada exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el área" });
        }

        // PUT: api/Areas - Editar un área
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Area area)
        {
            if (area == null || area.IdArea == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var areaExistente = await _data.ObtenerId(area.IdArea);
            if (areaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Área no encontrada" });
            }

            bool respuesta = await _data.Editar(area);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Área actualizada correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el área, pero existe" });
        }

        // DELETE: api/Areas/{id} - Eliminación lógica de un área
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var areaExistente = await _data.ObtenerId(id);
            if (areaExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Área no encontrada" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Área desactivada correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el área, pero existe" });
        }
    }
}