using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GruposController : ControllerBase
    {
        private readonly GrupoData _data;

        public GruposController(GrupoData data)
        {
            _data = data;
        }

        // GET: api/Grupos - Obtener todos los grupos activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Grupos/{id} - Obtener un grupo por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var grupo = await _data.ObtenerId(id);
            if (grupo == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Grupo no encontrado" });
            }
            return Ok(grupo);
        }

        // POST: api/Grupos - Crear un grupo
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Grupo grupo)
        {
            if (grupo == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(grupo);
            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Grupo creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el grupo" });
        }

        // PUT: api/Grupos - Editar un grupo
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Grupo grupo)
        {
            if (grupo == null || grupo.IdGrupo == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var grupoExistente = await _data.ObtenerId(grupo.IdGrupo);
            if (grupoExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Grupo no encontrado" });
            }

            bool respuesta = await _data.Editar(grupo);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Grupo actualizado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el grupo, pero existe" });
        }

        // DELETE: api/Grupos/{id} - Eliminación lógica de un grupo
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var grupoExistente = await _data.ObtenerId(id);
            if (grupoExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Grupo no encontrado" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Grupo desactivado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el grupo, pero existe" });
        }
    }
}