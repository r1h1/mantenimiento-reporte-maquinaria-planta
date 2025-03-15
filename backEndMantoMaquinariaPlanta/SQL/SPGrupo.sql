-- =============================================
-- Crear un nuevo grupo
-- =============================================
CREATE PROCEDURE sp_CrearGrupo
    @Nombre NVARCHAR(255),
    @IdArea INT,
    @Descripcion NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Grupos (Nombre, IdArea, Descripcion, Estado)
    VALUES (@Nombre, @IdArea, @Descripcion, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdGrupo; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los grupos activos
-- =============================================
CREATE PROCEDURE sp_ObtenerGrupos
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdGrupo, Nombre, IdArea, Descripcion, Estado
    FROM Grupos
    WHERE Estado = 1; -- Solo grupos activos
END;

-- =============================================
-- Obtener un grupo por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerGrupoPorId
    @IdGrupo INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdGrupo, Nombre, IdArea, Descripcion, Estado
    FROM Grupos
    WHERE IdGrupo = @IdGrupo;
END;

-- =============================================
-- Actualizar un grupo por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarGrupo
    @IdGrupo INT,
    @Nombre NVARCHAR(255),
    @IdArea INT,
    @Descripcion NVARCHAR(500) = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Grupos
    SET Nombre = @Nombre,
        IdArea = @IdArea,
        Descripcion = @Descripcion,
        Estado = @Estado
    WHERE IdGrupo = @IdGrupo;
END;

-- =============================================
-- Eliminar un grupo de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarGrupo
    @IdGrupo INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Grupos
    SET Estado = 0
    WHERE IdGrupo = @IdGrupo;
END;
