using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class GrupoData
    {
        private readonly string _conexion;

        public GrupoData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los grupos activos
        public async Task<List<Grupo>> Lista()
        {
            List<Grupo> lista = new List<Grupo>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerGrupos", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Grupo
                        {
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            Nombre = reader.GetString("Nombre"),
                            IdArea = reader.GetInt32("IdArea"),
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un grupo por ID
        public async Task<Grupo?> ObtenerId(int id)
        {
            Grupo? grupo = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerGrupoPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdGrupo", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        grupo = new Grupo
                        {
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            Nombre = reader.GetString("Nombre"),
                            IdArea = reader.GetInt32("IdArea"),
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return grupo;
        }

        // Crear un nuevo grupo
        public async Task<int> Crear(Grupo grupo)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", grupo.Nombre);
                cmd.Parameters.AddWithValue("@IdArea", grupo.IdArea);
                cmd.Parameters.AddWithValue("@Descripcion", (object)grupo.Descripcion ?? DBNull.Value);

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

        // Actualizar un grupo existente
        public async Task<bool> Editar(Grupo grupo)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdGrupo", grupo.IdGrupo);
                cmd.Parameters.AddWithValue("@Nombre", grupo.Nombre);
                cmd.Parameters.AddWithValue("@IdArea", grupo.IdArea);
                cmd.Parameters.AddWithValue("@Descripcion", (object)grupo.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", grupo.Estado);

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

        // Eliminar un grupo (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarGrupo", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdGrupo", id);

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