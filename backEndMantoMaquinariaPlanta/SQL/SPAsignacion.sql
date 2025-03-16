-- =============================================
-- Crear una nueva asignación
-- =============================================
CREATE PROCEDURE sp_CrearAsignacion
    @IdReporte INT,
    @IdGrupo INT,
    @IdUsuario INT,
    @FechaInicioTrabajo DATE = NULL,
    @DescripcionHallazgo NVARCHAR(500) = NULL,
    @MaterialesUtilizados NVARCHAR(500) = NULL,
    @EstadoAsignado NVARCHAR(50) = 'Asignado'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Asignaciones (IdReporte, IdGrupo, IdUsuario, EstadoAsignado, FechaInicioTrabajo, DescripcionHallazgo, MaterialesUtilizados, Estado)
    VALUES (@IdReporte, @IdGrupo, @IdUsuario, @EstadoAsignado, @FechaInicioTrabajo, @DescripcionHallazgo, @MaterialesUtilizados, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdAsignacion; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las asignaciones activas
-- =============================================
CREATE PROCEDURE sp_ObtenerAsignaciones
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAsignacion, IdReporte, IdGrupo, IdUsuario, EstadoAsignado, FechaInicioTrabajo, DescripcionHallazgo, MaterialesUtilizados, Estado
    FROM Asignaciones
    WHERE Estado = 1; -- Solo asignaciones activas
END;

-- =============================================
-- Obtener una asignación por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerAsignacionPorId
    @IdAsignacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAsignacion, IdReporte, IdGrupo, IdUsuario, EstadoAsignado, FechaInicioTrabajo, DescripcionHallazgo, MaterialesUtilizados, Estado
    FROM Asignaciones
    WHERE IdAsignacion = @IdAsignacion;
END;

-- =============================================
-- Actualizar una asignación por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarAsignacion
    @IdAsignacion INT,
    @IdReporte INT,
    @IdGrupo INT,
    @IdUsuario INT,
    @EstadoAsignado NVARCHAR(50),
    @FechaInicioTrabajo DATE = NULL,
    @DescripcionHallazgo NVARCHAR(500) = NULL,
    @MaterialesUtilizados NVARCHAR(500) = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Asignaciones
    SET IdReporte = @IdReporte,
        IdGrupo = @IdGrupo,
        IdUsuario = @IdUsuario,
        EstadoAsignado = @EstadoAsignado,
        FechaInicioTrabajo = @FechaInicioTrabajo,
        DescripcionHallazgo = @DescripcionHallazgo,
        MaterialesUtilizados = @MaterialesUtilizados,
        Estado = @Estado
    WHERE IdAsignacion = @IdAsignacion;

    -- Retornar el número de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Eliminar una asignación de forma lógica (desactivarla)
-- =============================================
CREATE PROCEDURE sp_EliminarAsignacion
    @IdAsignacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Asignaciones
    SET Estado = 0
    WHERE IdAsignacion = @IdAsignacion;

    -- Retornar el número de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;