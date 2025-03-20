using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class AuthData
    {
        private readonly string _conexion;

        public AuthData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las cuentas activas
        public async Task<List<Auth>> Lista()
        {
            List<Auth> lista = new List<Auth>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerAuth", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Auth
                        {
                            IdAuth = reader.GetInt32("IdAuth"),
                            Usuario = reader.GetString("Usuario"),
                            FechaCreacion = reader.GetDateTime("FechaCreacion"),
                            IdRol = reader.GetInt32("IdRol"),
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un usuario por nombre de usuario (para validación en login)
        public async Task<Auth?> ValidarUsuario(string usuario)
        {
            Auth? auth = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerClavePorUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Usuario", usuario);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        auth = new Auth
                        {
                            Usuario = reader.GetString("Usuario"),
                            Clave = reader.GetString("Clave"), // Contraseña encriptada
                            IdRol = reader.GetInt32("IdRol"),
                            IdUsuario = reader.GetInt32("IdUsuario")
                        };
                    }
                }
            }
            return auth;
        }

        // Registrar un usuario con contraseña encriptada
        public async Task<int> Registrar(Auth usuario)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearAuth", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Usuario", usuario.Usuario);
                cmd.Parameters.AddWithValue("@ClaveHasheada", usuario.Clave); // La clave ya debe venir hasheada
                cmd.Parameters.AddWithValue("@IdRol", usuario.IdRol);
                cmd.Parameters.AddWithValue("@IdUsuario", usuario.IdUsuario);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0); // Retorna el ID del nuevo usuario
                    }
                }
            }
            return nuevoId;
        }

        // Editar la contraseña de un usuario
        public async Task<bool> EditarClave(int idUsuario, string usuario, string nuevaClave)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarClaveAuth", con);
                cmd.CommandType = CommandType.StoredProcedure;

                // Encriptar la nueva clave antes de enviarla al SP
                string claveHasheada = BCrypt.Net.BCrypt.HashPassword(nuevaClave);

                cmd.Parameters.AddWithValue("@IdUsuario", idUsuario);
                cmd.Parameters.AddWithValue("@Usuario", usuario);
                cmd.Parameters.AddWithValue("@ClaveHasheada", claveHasheada);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        int filasAfectadas = reader.GetInt32(0);
                        return filasAfectadas > 0;
                    }
                }
            }
            return false;
        }
    }
}