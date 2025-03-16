using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class AsignacionData
    {
        private readonly string _conexion;

        public AsignacionData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las asignaciones activas
        public async Task<List<Asignacion>> Lista()
        {
            List<Asignacion> lista = new List<Asignacion>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerAsignaciones", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Asignacion
                        {
                            IdAsignacion = reader.GetInt32("IdAsignacion"),
                            IdReporte = reader.GetInt32("IdReporte"),
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            EstadoAsignado = reader.GetString("EstadoAsignado"),
                            FechaInicioTrabajo = reader["FechaInicioTrabajo"] as DateTime?,
                            DescripcionHallazgo = reader["DescripcionHallazgo"] as string,
                            MaterialesUtilizados = reader["MaterialesUtilizados"] as string,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener una asignación por ID
        public async Task<Asignacion?> ObtenerId(int id)
        {
            Asignacion? asignacion = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerAsignacionPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdAsignacion", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        asignacion = new Asignacion
                        {
                            IdAsignacion = reader.GetInt32("IdAsignacion"),
                            IdReporte = reader.GetInt32("IdReporte"),
                            IdGrupo = reader.GetInt32("IdGrupo"),
                            IdUsuario = reader.GetInt32("IdUsuario"),
                            EstadoAsignado = reader.GetString("EstadoAsignado"),
                            FechaInicioTrabajo = reader["FechaInicioTrabajo"] as DateTime?,
                            DescripcionHallazgo = reader["DescripcionHallazgo"] as string,
                            MaterialesUtilizados = reader["MaterialesUtilizados"] as string,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return asignacion;
        }

        // Crear una nueva asignación
        public async Task<int> Crear(Asignacion asignacion)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearAsignacion", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdReporte", asignacion.IdReporte);
                cmd.Parameters.AddWithValue("@IdGrupo", asignacion.IdGrupo);
                cmd.Parameters.AddWithValue("@IdUsuario", asignacion.IdUsuario);
                cmd.Parameters.AddWithValue("@EstadoAsignado", asignacion.EstadoAsignado);
                cmd.Parameters.AddWithValue("@FechaInicioTrabajo", (object)asignacion.FechaInicioTrabajo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@DescripcionHallazgo", (object)asignacion.DescripcionHallazgo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MaterialesUtilizados", (object)asignacion.MaterialesUtilizados ?? DBNull.Value);

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

        // Actualizar una asignación existente
        public async Task<bool> Editar(Asignacion asignacion)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarAsignacion", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdAsignacion", asignacion.IdAsignacion);
                cmd.Parameters.AddWithValue("@IdReporte", asignacion.IdReporte);
                cmd.Parameters.AddWithValue("@IdGrupo", asignacion.IdGrupo);
                cmd.Parameters.AddWithValue("@IdUsuario", asignacion.IdUsuario);
                cmd.Parameters.AddWithValue("@EstadoAsignado", asignacion.EstadoAsignado);
                cmd.Parameters.AddWithValue("@FechaInicioTrabajo", (object)asignacion.FechaInicioTrabajo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@DescripcionHallazgo", (object)asignacion.DescripcionHallazgo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MaterialesUtilizados", (object)asignacion.MaterialesUtilizados ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", asignacion.Estado);

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

        // Eliminar una asignación (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarAsignacion", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdAsignacion", id);

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