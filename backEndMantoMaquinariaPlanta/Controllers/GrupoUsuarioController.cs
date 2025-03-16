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
    public class GrupoUsuariosController : ControllerBase
    {
        private readonly GrupoUsuarioData _data;

        public GrupoUsuariosController(GrupoUsuarioData data)
        {
            _data = data;
        }

        // GET: api/GrupoUsuarios/Grupo/{idGrupo} - Obtener todos los usuarios de un grupo
        [HttpGet("Grupo/{idGrupo}")]
        [Authorize]
        public async Task<IActionResult> ObtenerUsuariosDeGrupo(int idGrupo)
        {
            var lista = await _data.ObtenerUsuariosDeGrupo(idGrupo);
            return Ok(lista);
        }

        // GET: api/GrupoUsuarios/Usuario/{idUsuario} - Obtener todos los grupos de un usuario
        [HttpGet("Usuario/{idUsuario}")]
        [Authorize]
        public async Task<IActionResult> ObtenerGruposDeUsuario(int idUsuario)
        {
            var lista = await _data.ObtenerGruposDeUsuario(idUsuario);
            return Ok(lista);
        }

        // POST: api/GrupoUsuarios - Agregar un usuario a un grupo
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AgregarUsuarioAGrupo([FromBody] GrupoUsuario grupoUsuario)
        {
            if (grupoUsuario == null)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            bool respuesta = await _data.AgregarUsuarioAGrupo(grupoUsuario);
            return respuesta
                ? StatusCode(StatusCodes.Status201Created, new { code = 201, isSuccess = true, message = "Usuario agregado al grupo exitosamente" })
                : StatusCode(StatusCodes.Status409Conflict, new { code = 409, isSuccess = false, message = "No se pudo agregar el usuario al grupo" });
        }

        // DELETE: api/GrupoUsuarios/{idGrupo}/{idUsuario} - Desactivar usuario de un grupo
        [HttpDelete("{idGrupo}/{idUsuario}")]
        [Authorize]
        public async Task<IActionResult> EliminarUsuarioDeGrupo(int idGrupo, int idUsuario)
        {
            var usuarioExistente = await _data.ObtenerUsuariosDeGrupo(idGrupo);
            if (usuarioExistente == null || usuarioExistente.Count == 0)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Relación Grupo-Usuario no encontrada" });
            }

            bool respuesta = await _data.EliminarUsuarioDeGrupo(idGrupo, idUsuario);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Usuario eliminado del grupo correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en la relación Grupo-Usuario" });
        }

        // PUT: api/GrupoUsuarios/Reactivar/{idGrupo}/{idUsuario} - Reactivar usuario en un grupo
        [HttpPut("Reactivar/{idGrupo}/{idUsuario}")]
        [Authorize]
        public async Task<IActionResult> ReactivarUsuarioEnGrupo(int idGrupo, int idUsuario)
        {
            var usuarioExistente = await _data.ObtenerUsuariosDeGrupo(idGrupo);
            if (usuarioExistente == null || usuarioExistente.Count == 0)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Relación Grupo-Usuario no encontrada" });
            }

            bool respuesta = await _data.ReactivarUsuarioEnGrupo(idGrupo, idUsuario);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Usuario reactivado en el grupo correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en la relación Grupo-Usuario" });
        }
    }
}