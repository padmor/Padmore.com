-- Fields the portfolio interface displays that the tables could not store.

BEGIN;

ALTER TABLE public.projects
    ADD COLUMN project_type TEXT,
    ADD COLUMN category TEXT,
    ADD COLUMN artwork TEXT NOT NULL DEFAULT 'portfolio'
        CHECK (artwork IN ('commerce', 'tasks', 'portfolio', 'weather', 'study', 'chat')),
    DROP CONSTRAINT projects_lifecycle_status_check,
    ADD CONSTRAINT projects_lifecycle_status_check CHECK (
        lifecycle_status IN (
            'idea',
            'planning',
            'in_progress',
            'testing',
            'beta',
            'live',
            'paused',
            'completed',
            'archived'
        )
    );

CREATE INDEX projects_category_idx ON public.projects(category);

ALTER TABLE public.achievements
    ADD COLUMN icon TEXT CHECK (icon IS NULL OR LENGTH(icon) <= 8);

COMMIT;
