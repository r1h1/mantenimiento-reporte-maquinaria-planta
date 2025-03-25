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
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioData _data;

        public UsuariosController(UsuarioData data)
        {
            _data = data;
        }

        // GET: api/Usuarios - Obtener todos los usuarios activos
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Lista()
        {
            var lista = await _data.Lista();
            return Ok(lista);
        }

        // GET: api/Usuarios/{id} - Obtener un usuario por ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Obtener(int id)
        {
            var usuario = await _data.ObtenerId(id);
            if (usuario == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado" });
            }
            return Ok(usuario);
        }


        // POST: api/Usuarios - Crear usuario con Auth
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Crear([FromBody] UsuarioConAuth modelo)
        {
            if (modelo == null || modelo.Usuario == null || modelo.Auth == null)
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos." });

            try
            {
                var authData = new AuthData(new ConfigurationBuilder().AddJsonFile("appsettings.json").Build());
                var creado = await _data.CrearUsuarioConAuth(modelo, authData);

                if (creado)
                    return Created("", new { code = 201, isSuccess = true, message = "Usuario y credenciales creados correctamente." });
                else
                    return StatusCode(500, new { code = 500, isSuccess = false, message = "No se pudo crear el usuario." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { code = 500, isSuccess = false, message = "Error interno del servidor.", detalle = ex.Message });
            }
        }



        // PUT: api/Usuarios - Editar un usuario
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Editar([FromBody] Usuarios usuario)
        {
            if (usuario == null || usuario.IdUsuario == 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos" });
            }

            var usuarioExistente = await _data.ObtenerId(usuario.IdUsuario);
            if (usuarioExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado" });
            }

            bool respuesta = await _data.Editar(usuario);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Usuario actualizado correctamente" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el usuario, pero existe" });
        }

        // DELETE: api/Usuarios/{id} - Eliminación lógica de un usuario en Usuarios y Auth
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Eliminar(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "ID inválido" });
            }

            var usuarioExistente = await _data.ObtenerId(id);
            if (usuarioExistente == null)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado" });
            }

            bool respuesta = await _data.Eliminar(id);
            return respuesta
                ? Ok(new { code = 200, isSuccess = true, message = "Usuario desactivado correctamente en Usuarios y Auth" })
                : Ok(new { code = 200, isSuccess = true, message = "No hubo cambios en el usuario, pero existe" });
        }
    }
}