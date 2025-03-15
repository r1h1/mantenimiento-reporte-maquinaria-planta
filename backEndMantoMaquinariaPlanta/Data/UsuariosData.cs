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
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return usuario;
        }

        // Crear un usuario y devolver su ID
        public async Task<int> Crear(Usuarios usuario)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@NombreCompleto", usuario.NombreCompleto);
                cmd.Parameters.AddWithValue("@TelefonoPersonal", (object)usuario.TelefonoPersonal ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@TelefonoCorporativo", (object)usuario.TelefonoCorporativo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Direccion", (object)usuario.Direccion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@CorreoElectronico", usuario.CorreoElectronico);
                cmd.Parameters.AddWithValue("@IdArea", (object)usuario.IdArea ?? DBNull.Value);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0);
                    }
                }
            }
            return nuevoId;
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

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar (desactivar) un usuario
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarUsuario", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdUsuario", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
