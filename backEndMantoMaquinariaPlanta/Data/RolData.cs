using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class RolData
    {
        private readonly string _conexion;

        public RolData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los roles activos
        public async Task<List<Rol>> Lista()
        {
            List<Rol> lista = new List<Rol>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerRoles", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Rol
                        {
                            IdRol = reader.GetInt32("IdRol"),
                            Nombre = reader.GetString("Nombre"),
                            IdMenu = reader["IdMenu"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un rol por ID
        public async Task<Rol?> ObtenerId(int id)
        {
            Rol? rol = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerRolPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdRol", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        rol = new Rol
                        {
                            IdRol = reader.GetInt32("IdRol"),
                            Nombre = reader.GetString("Nombre"),
                            IdMenu = reader["IdMenu"] as int?,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return rol;
        }

        // Crear un nuevo rol
        public async Task<int> Crear(Rol rol)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearRol", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", rol.Nombre);
                cmd.Parameters.AddWithValue("@IdMenu", (object)rol.IdMenu ?? DBNull.Value);

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

        // Editar un rol
        public async Task<bool> Editar(Rol rol)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarRol", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdRol", rol.IdRol);
                cmd.Parameters.AddWithValue("@Nombre", rol.Nombre);
                cmd.Parameters.AddWithValue("@IdMenu", (object)rol.IdMenu ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", rol.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar un rol (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarRol", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdRol", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
