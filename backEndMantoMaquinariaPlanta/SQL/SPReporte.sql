-- =============================================
-- Crear un nuevo reporte de mantenimiento
-- =============================================
CREATE PROCEDURE sp_CrearReporte
    @IdArea INT,
    @IdMaquina INT,
    @Impacto NVARCHAR(50),
    @PersonasLastimadas BIT,
    @DanosMateriales BIT,
    @Titulo NVARCHAR(255),
    @MedidasTomadas NVARCHAR(500) = NULL,
    @Descripcion NVARCHAR(1000) = NULL,
    @EstadoReporte NVARCHAR(50) = 'Pendiente'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Reportes (IdArea, IdMaquina, Impacto, PersonasLastimadas, DanosMateriales, FechaReporte, Titulo, MedidasTomadas, Descripcion, EstadoReporte, Estado)
    VALUES (@IdArea, @IdMaquina, @Impacto, @PersonasLastimadas, @DanosMateriales, GETDATE(), @Titulo, @MedidasTomadas, @Descripcion, @EstadoReporte, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdReporte; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los reportes activos
-- =============================================
CREATE PROCEDURE sp_ObtenerReportes
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdReporte, IdArea, IdMaquina, Impacto, PersonasLastimadas, DanosMateriales, FechaReporte, Titulo, MedidasTomadas, Descripcion, EstadoReporte, Estado
    FROM Reportes
    WHERE Estado = 1; -- Solo reportes activos
END;

-- =============================================
-- Obtener un reporte por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerReportePorId
    @IdReporte INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdReporte, IdArea, IdMaquina, Impacto, PersonasLastimadas, DanosMateriales, FechaReporte, Titulo, MedidasTomadas, Descripcion, EstadoReporte, Estado
    FROM Reportes
    WHERE IdReporte = @IdReporte;
END;

-- =============================================
-- Actualizar un reporte por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarReporte
    @IdReporte INT,
    @IdArea INT,
    @IdMaquina INT,
    @Impacto NVARCHAR(50),
    @PersonasLastimadas BIT,
    @DanosMateriales BIT,
    @Titulo NVARCHAR(255),
    @MedidasTomadas NVARCHAR(500) = NULL,
    @Descripcion NVARCHAR(1000) = NULL,
    @EstadoReporte NVARCHAR(50),
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Reportes
    SET IdArea = @IdArea,
        IdMaquina = @IdMaquina,
        Impacto = @Impacto,
        PersonasLastimadas = @PersonasLastimadas,
        DanosMateriales = @DanosMateriales,
        Titulo = @Titulo,
        MedidasTomadas = @MedidasTomadas,
        Descripcion = @Descripcion,
        EstadoReporte = @EstadoReporte,
        Estado = @Estado
    WHERE IdReporte = @IdReporte;
END;

-- =============================================
-- Eliminar un reporte de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarReporte
    @IdReporte INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Reportes
    SET Estado = 0
    WHERE IdReporte = @IdReporte;
END;
