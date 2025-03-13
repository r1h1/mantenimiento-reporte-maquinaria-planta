-- Menus Table
CREATE TABLE Menu (
    IdMenu INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    RutaHTML NVARCHAR(MAX) NOT NULL,
    Estado BIT NOT NULL DEFAULT 1 -- 1: Activa, 0: Inactiva
);

-- Rol Table
CREATE TABLE Rol (
    IdRol INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(500) UNIQUE NOT NULL,
    IdMenu INT NULL,
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Rol_Menu FOREIGN KEY (IdMenu) REFERENCES Menu(IdMenu) ON DELETE CASCADE
);

-- Plants Table
CREATE TABLE Plantas (
    IdPlanta INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) UNIQUE NOT NULL,
    Descripcion NVARCHAR(500),
    UbicacionYDireccion NVARCHAR(500) UNIQUE,
    Estado BIT NOT NULL DEFAULT 1 -- 1: Activa, 0: Inactiva
);

-- Areas Table
CREATE TABLE Areas (
    IdArea INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) UNIQUE NOT NULL,
    Ubicacion NVARCHAR(255) NULL,
    IdPlanta INT NULL,
    Descripcion NVARCHAR(500),
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Areas_Planta FOREIGN KEY (IdPlanta) REFERENCES Plantas(IdPlanta) ON DELETE CASCADE
);

-- Users Table
CREATE TABLE Usuarios (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto NVARCHAR(255) UNIQUE NOT NULL,
    TelefonoPersonal VARCHAR(20) UNIQUE,
    TelefonoCorporativo VARCHAR(20) UNIQUE,
    Direccion NVARCHAR(255),
    CorreoElectronico NVARCHAR(255) UNIQUE NOT NULL,
    IdArea INT NULL,
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Usuarios_Area FOREIGN KEY (IdArea) REFERENCES Areas(IdArea) ON DELETE CASCADE
);

-- Type of Machines Table
CREATE TABLE TipoMaquinas (
    IdTipoMaquina INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) UNIQUE NOT NULL,
    Descripcion NVARCHAR(500),
    Estado BIT NOT NULL DEFAULT 1 -- 1: Activa, 0: Inactiva
);

-- Machines Table
CREATE TABLE Maquinas (
    IdMaquina INT IDENTITY(1,1) PRIMARY KEY,
    NombreCodigo NVARCHAR(255) NOT NULL UNIQUE,
    IdTipoMaquina INT NOT NULL,
    IdArea INT NULL,
    IdPlanta INT NULL,
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Maquinas_Area FOREIGN KEY (IdArea) REFERENCES Areas(IdArea),
    CONSTRAINT FK_Maquinas_Planta FOREIGN KEY (IdPlanta) REFERENCES Plantas(IdPlanta),
    CONSTRAINT FK_Maquinas_Tipo FOREIGN KEY (IdTipoMaquina) REFERENCES TipoMaquinas(IdTipoMaquina)
);

-- Groups Table
CREATE TABLE Grupos (
    IdGrupo INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) UNIQUE NOT NULL,
    IdArea INT NOT NULL,
    Descripcion NVARCHAR(500),
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Grupos_Area FOREIGN KEY (IdArea) REFERENCES Areas(IdArea) ON DELETE CASCADE
);

-- User Groups Relation Table
CREATE TABLE GrupoUsuarios (
    IdGrupo INT NOT NULL,
    IdUsuario INT NOT NULL,
    PRIMARY KEY (IdGrupo, IdUsuario),
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_GrupoUsuarios_Grupo FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo) ON DELETE CASCADE,
    CONSTRAINT FK_GrupoUsuarios_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- Maintenance Reports Table
CREATE TABLE Reportes (
    IdReporte INT IDENTITY(1,1) PRIMARY KEY,
    IdArea INT NOT NULL,
    IdMaquina INT NOT NULL,
    Impacto NVARCHAR(50) NOT NULL,
    PersonasLastimadas BIT NOT NULL,
    DanosMateriales BIT NOT NULL,
    FechaReporte DATE NOT NULL DEFAULT GETDATE(),
    Titulo NVARCHAR(255) NOT NULL,
    MedidasTomadas NVARCHAR(500),
    Descripcion NVARCHAR(1000),
    EstadoReporte NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Reportes_Area FOREIGN KEY (IdArea) REFERENCES Areas(IdArea) ON DELETE CASCADE,
    CONSTRAINT FK_Reportes_Maquina FOREIGN KEY (IdMaquina) REFERENCES Maquinas(IdMaquina) ON DELETE CASCADE
);

-- Assignments Table
CREATE TABLE Asignaciones (
    IdAsignacion INT IDENTITY(1,1) PRIMARY KEY,
    IdReporte INT NOT NULL,
    IdGrupo INT NOT NULL,
    IdUsuario INT NOT NULL,
    EstadoAsignado NVARCHAR(50) NOT NULL DEFAULT 'Asignado',
    FechaInicioTrabajo DATE,
    DescripcionHallazgo NVARCHAR(500),
    MaterialesUtilizados NVARCHAR(500),
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Asignaciones_Reporte FOREIGN KEY (IdReporte) REFERENCES Reportes(IdReporte) ON DELETE CASCADE,
    CONSTRAINT FK_Asignaciones_Grupo FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo),
    CONSTRAINT FK_Asignaciones_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- Completion Table
CREATE TABLE Finalizaciones (
    IdFinalizacion INT IDENTITY(1,1) PRIMARY KEY,
    IdAsignacion INT NOT NULL,
    FechaFinTrabajo DATE NOT NULL,
    DescripcionSolucion NVARCHAR(1000) NOT NULL,
    EstadoFinalizado NVARCHAR(50) NOT NULL DEFAULT 'Finalizado',
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Finalizaciones_Asignacion FOREIGN KEY (IdAsignacion) REFERENCES Asignaciones(IdAsignacion) ON DELETE CASCADE
);

-- Auth Table
CREATE TABLE Auth (
    IdAuth INT IDENTITY(1,1) PRIMARY KEY,
    Usuario NVARCHAR(500) UNIQUE NOT NULL,
    Clave NVARCHAR(500) NOT NULL,
    FechaCreacion DATE,
    IdRol INT NOT NULL,
    IdUsuario INT NOT NULL,
    Estado BIT NOT NULL DEFAULT 1, -- 1: Activa, 0: Inactiva
    CONSTRAINT FK_Auth_Rol FOREIGN KEY (IdRol) REFERENCES Rol(IdRol) ON DELETE CASCADE,
    CONSTRAINT FK_Usuarios_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario) ON DELETE CASCADE
);
