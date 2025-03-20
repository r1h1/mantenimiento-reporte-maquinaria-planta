using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class UsuarioData
    {
        private readonly string _conexion;

        public UsuarioData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los usuarios activos
        public async Task<List<Usuarios>> Lista()
        {
            List<Usuarios> lista = new List<Usuarios>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerUsuarios", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Usuarios
                        {
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            NombreCompleto = reader.GetString("NombreCompleto"),
                            TelefonoPersonal = reader["TelefonoPersonal"] as string,
                            TelefonoCorporativo = reader["TelefonoCorporativo"] as string,
                            Direccion = reader["Direccion"] as string,
                            CorreoElectronico = reader.GetString("CorreoElectronico"),
                            IdArea = reader["IdArea"] as int?,
                            Usuario = reader["Usuario"] as string,  // Puede ser null
                            IdRol = reader["IdRol"] as int?,  // Puede ser null
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un usuario por ID
        public async Task<Usuarios?> ObtenerId(int id)
        {
            Usuarios? usuario = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerUsuarioPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        usuario = new Usuarios
                        {
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            NombreCompleto = reader.GetString("NombreCompleto"),
                            TelefonoPersonal = reader["TelefonoPersonal"] as string,
                            TelefonoCorporativo = reader["TelefonoCorporativo"] as string,
                            Direccion = reader["Direccion"] as string,
                            CorreoElectronico = reader.GetString("CorreoElectronico"),
                            IdArea = reader["IdArea"] as int?,
                            Usuario = reader["Usuario"] as string,
                            IdRol = reader["IdRol"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return usuario;
        }

        // Editar un usuario
        public async Task<bool> Editar(Usuarios usuario)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdUsuario", usuario.IdUsuario);
                cmd.Parameters.AddWithValue("@NombreCompleto", usuario.NombreCompleto);
                cmd.Parameters.AddWithValue("@TelefonoPersonal", (object)usuario.TelefonoPersonal ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@TelefonoCorporativo", (object)usuario.TelefonoCorporativo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Direccion", (object)usuario.Direccion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@CorreoElectronico", usuario.CorreoElectronico);
                cmd.Parameters.AddWithValue("@IdArea", (object)usuario.IdArea ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", usuario.Estado);
                cmd.Parameters.AddWithValue("@Usuario", (object)usuario.Usuario ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdRol", (object)usuario.IdRol ?? DBNull.Value);

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

        // Eliminar (desactivar) un usuario en Usuarios y Auth
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", id);

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