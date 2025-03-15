-- =============================================
-- Crear un nuevo tipo de máquina
-- =============================================
CREATE PROCEDURE sp_CrearTipoMaquina
    @Nombre NVARCHAR(255),
    @Descripcion NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO TipoMaquinas (Nombre, Descripcion, Estado)
    VALUES (@Nombre, @Descripcion, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdTipoMaquina; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los tipos de máquinas activas
-- =============================================
CREATE PROCEDURE sp_ObtenerTipoMaquinas
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdTipoMaquina, Nombre, Descripcion, Estado
    FROM TipoMaquinas
    WHERE Estado = 1; -- Solo tipos de máquinas activas
END;

-- =============================================
-- Obtener un tipo de máquina por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerTipoMaquinaPorId
    @IdTipoMaquina INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdTipoMaquina, Nombre, Descripcion, Estado
    FROM TipoMaquinas
    WHERE IdTipoMaquina = @IdTipoMaquina;
END;

-- =============================================
-- Actualizar un tipo de máquina por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarTipoMaquina
    @IdTipoMaquina INT,
    @Nombre NVARCHAR(255),
    @Descripcion NVARCHAR(500) = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE TipoMaquinas
    SET Nombre = @Nombre,
        Descripcion = @Descripcion,
        Estado = @Estado
    WHERE IdTipoMaquina = @IdTipoMaquina;
END;

-- =============================================
-- Eliminar un tipo de máquina de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarTipoMaquina
    @IdTipoMaquina INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE TipoMaquinas
    SET Estado = 0
    WHERE IdTipoMaquina = @IdTipoMaquina;
END;
