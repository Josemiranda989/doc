MODELO DE DATOS — CuidAR (MVP)
PostgreSQL · Entidad principal: persona_a_cargo

ENUMS
  tipo_condicion    : 'diagnostico' | 'alergia'
  forma_medicacion  : 'comprimido' | 'gota' | 'ml' | 'aplicacion'
  estado_medicacion : 'activa' | 'discontinuada'

ENTIDADES

cuidador
  id                 uuid          PK
  nombre             text          NOT NULL
  telefono           text
  created_at         timestamptz   DEFAULT now()

persona_a_cargo  ⭐ PRINCIPAL
  id                 uuid          PK
  cuidador_id        uuid          FK → cuidador.id  NOT NULL
  nombre_completo    text          NOT NULL
  fecha_nacimiento   date          NOT NULL          -- edad se calcula con age()
  dni                text
  parentesco         text
  obra_social        text
  numero_afiliado    text
  notas              text
  created_at         timestamptz   DEFAULT now()
  updated_at         timestamptz   DEFAULT now()

condicion
  id                 uuid              PK
  persona_id         uuid              FK → persona_a_cargo.id  ON DELETE CASCADE  NOT NULL
  tipo               tipo_condicion    NOT NULL
  descripcion        text              NOT NULL

medico
  id                 uuid          PK
  persona_id         uuid          FK → persona_a_cargo.id  ON DELETE CASCADE  NOT NULL
  nombre             text          NOT NULL
  especialidad       text
  matricula          text

medicacion
  id                 uuid               PK
  persona_id         uuid               FK → persona_a_cargo.id  ON DELETE CASCADE  NOT NULL
  medico_id          uuid               FK → medico.id  ON DELETE SET NULL  NULL
  droga              text               NOT NULL
  nombre_comercial   text
  concentracion      text               NOT NULL      -- "10 mg", "500 mg / 400 UI"
  cantidad_por_toma  numeric(5,2)       NOT NULL
  forma              forma_medicacion   NOT NULL
  via                text
  motivo             text
  indicaciones       text
  es_sos             boolean            NOT NULL DEFAULT false
  estado             estado_medicacion  NOT NULL DEFAULT 'activa'
  fecha_inicio       date               NOT NULL
  fecha_fin          date
  motivo_baja        text

horario_toma
  id                 uuid          PK
  medicacion_id      uuid          FK → medicacion.id  ON DELETE CASCADE  NOT NULL
  hora               time          NOT NULL
  dias_semana        smallint[]    NOT NULL DEFAULT '{0,1,2,3,4,5,6}'   -- 0 = domingo

RELACIONES
  cuidador         1 ── N  persona_a_cargo
  persona_a_cargo  1 ── N  condicion
  persona_a_cargo  1 ── N  medico
  persona_a_cargo  1 ── N  medicacion
  medico           1 ── N  medicacion      (opcional: medicacion.medico_id puede ser NULL)
  medicacion       1 ── N  horario_toma    (una medicación SOS no tiene horarios)