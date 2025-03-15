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
    public class RolController : ControllerBase
    {
        private readonly RolData _data;

        public RolController(RolData data)
        {
            _data = data;
        }

        // GET: api/Rol - Obtener todos los roles activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Rol/{id} - Obtener un rol por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var rol = await _data.ObtenerId(id);
            if (rol == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Rol no encontrado" });
            }
            return Ok(rol);
        }

        // POST: api/Rol - Crear un rol
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] Rol rol)
        {
            if (rol == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            int nuevoId = await _data.Crear(rol);

            return nuevoId > 0
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Rol creado exitosamente", id = nuevoId })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo crear el rol" });
        }

        // PUT: api/Rol - Editar un rol
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Rol rol)
        {
            if (rol == null || rol.IdRol == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.Editar(rol);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Rol actualizado correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Rol no encontrado" });
        }

        // DELETE: api/Rol/{id} - Eliminación lógica de un rol
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Rol desactivado correctamente" })
                : NotFound(new { code = 404, isSuccess = false, message = "Rol no encontrado" });
        }
    }
}
