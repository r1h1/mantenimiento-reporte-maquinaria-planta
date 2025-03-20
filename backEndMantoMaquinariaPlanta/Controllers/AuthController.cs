using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using mantoMaquinariaPlanta.Data;
using mantoMaquinariaPlanta.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

namespace mantoMaquinariaPlanta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthData _authData;
        private readonly IConfiguration _config;

        public AuthController(AuthData authData, IConfiguration config)
        {
            _authData = authData;
            _config = config;
        }

        // POST: api/Auth/Login - Autenticación de usuario
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Usuario) || string.IsNullOrEmpty(request.Clave))
                return BadRequest(new { message = "Usuario o contraseña no pueden estar vacíos." });

            var usuario = await _authData.ValidarUsuario(request.Usuario);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Clave, usuario.Clave))
            {
                return Unauthorized(new { code = 401, message = "Usuario o contraseña incorrectos." });
            }

            var secretKey = _config.GetSection("settings")["secretkey"];

            if (string.IsNullOrEmpty(secretKey))
                throw new ArgumentNullException("Secret key not found in appsettings.json.");

            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, usuario.Usuario),
                new Claim(ClaimTypes.Role, usuario.IdRol.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenConfig = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(tokenConfig);

            return Ok(new
            {
                code = 200,
                message = "Autenticación exitosa",
                token
            });
        }

        // POST: api/Auth/Registrar - Registro de usuario
        [HttpPost("Registrar")]
        public async Task<IActionResult> Registrar([FromBody] Auth usuario)
        {
            if (string.IsNullOrEmpty(usuario.Usuario) || string.IsNullOrEmpty(usuario.Clave))
                return BadRequest(new { message = "Usuario y contraseña son obligatorios." });

            // Verificar si el usuario ya existe
            var usuarioExistente = await _authData.ValidarUsuario(usuario.Usuario);
            if (usuarioExistente != null)
                return Conflict(new { message = "El usuario ya existe." });

            // Encriptar la contraseña antes de almacenarla
            usuario.Clave = BCrypt.Net.BCrypt.HashPassword(usuario.Clave);

            int nuevoId = await _authData.Registrar(usuario);

            if (nuevoId > 0)
                return Ok(new { code = 201, message = "Usuario registrado con éxito.", id = nuevoId });

            return StatusCode(500, new { message = "Error al registrar el usuario." });
        }

        // PUT: api/Auth/CambiarClave - Cambiar contraseña
        [HttpPut("CambiarClave")]
        [Authorize]
        public async Task<IActionResult> CambiarClave([FromBody] CambiarClaveRequest request)
        {
            if (string.IsNullOrEmpty(request.Usuario) || string.IsNullOrEmpty(request.NuevaClave) || request.IdUsuario <= 0)
            {
                return BadRequest(new { code = 400, isSuccess = false, message = "Datos inválidos." });
            }

            var usuarioExistente = await _authData.ValidarUsuario(request.Usuario);
            if (usuarioExistente == null || usuarioExistente.IdUsuario != request.IdUsuario)
            {
                return NotFound(new { code = 404, isSuccess = false, message = "Usuario no encontrado en Auth." });
            }

            bool resultado = await _authData.EditarClave(request.IdUsuario, request.Usuario, request.NuevaClave);

            return resultado
                ? Ok(new { code = 200, isSuccess = true, message = "Contraseña actualizada correctamente." })
                : StatusCode(500, new { code = 500, isSuccess = false, message = "Error al actualizar la contraseña." });
        }


        // GET: api/Auth/ValidarToken - Verifica si el token es válido
        [HttpGet("ValidarToken")]
        [Authorize]
        public IActionResult ValidarToken()
        {
            return Ok(new { code = 200, message = "Token válido." });
        }
    }
}