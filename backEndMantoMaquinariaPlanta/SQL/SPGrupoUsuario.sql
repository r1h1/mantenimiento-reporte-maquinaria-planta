-- =============================================
-- Agregar un usuario a un grupo
-- =============================================
CREATE PROCEDURE sp_AgregarUsuarioAGrupo
    @IdGrupo INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM GrupoUsuarios 
        WHERE IdGrupo = @IdGrupo AND IdUsuario = @IdUsuario
    )
    BEGIN
        INSERT INTO GrupoUsuarios (IdGrupo, IdUsuario, Estado)
        VALUES (@IdGrupo, @IdUsuario, 1);
    END;
END;

-- =============================================
-- Obtener todos los usuarios de un grupo activo
-- =============================================
CREATE PROCEDURE sp_ObtenerUsuariosDeGrupo
    @IdGrupo INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT GU.IdGrupo, GU.IdUsuario, U.NombreCompleto, U.CorreoElectronico, GU.Estado
    FROM GrupoUsuarios GU
    INNER JOIN Usuarios U ON GU.IdUsuario = U.IdUsuario
    WHERE GU.IdGrupo = @IdGrupo AND GU.Estado = 1; -- Solo relaciones activas
END;

-- =============================================
-- Obtener todos los grupos a los que pertenece un usuario activo
-- =============================================
CREATE PROCEDURE sp_ObtenerGruposDeUsuario
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT GU.IdGrupo, G.Nombre AS NombreGrupo, G.Descripcion, GU.IdUsuario, GU.Estado
    FROM GrupoUsuarios GU
    INNER JOIN Grupos G ON GU.IdGrupo = G.IdGrupo
    WHERE GU.IdUsuario = @IdUsuario AND GU.Estado = 1; -- Solo relaciones activas
END;

-- =============================================
-- Eliminar de forma lógica a un usuario de un grupo (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarUsuarioDeGrupo
    @IdGrupo INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE GrupoUsuarios
    SET Estado = 0
    WHERE IdGrupo = @IdGrupo AND IdUsuario = @IdUsuario;

    -- Retornar el número de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Restaurar un usuario en un grupo (reactivarlo)
-- =============================================
CREATE PROCEDURE sp_ReactivarUsuarioEnGrupo
    @IdGrupo INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE GrupoUsuarios
    SET Estado = 1
    WHERE IdGrupo = @IdGrupo AND IdUsuario = @IdUsuario;

    -- Retornar el número de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;
