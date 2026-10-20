import type { ProjectIntroData } from '../../types/project';
import { useProjectTitleReveal } from '../../effects/ProjectTitles/useProjectTitleReveal';
import { useProjectParallax } from '../../effects/ProjectParallax/useProjectParallax';
import './ProjectIntro.css';

interface ProjectIntroProps {
  readonly project: ProjectIntroData;
}

function ProjectIntro({ project }: ProjectIntroProps) {
  const headingId = `${project.id}-title`;
  const titleRef = useProjectTitleReveal();
  const illustrationRef = useProjectParallax(project.id, project.illustration.status === 'ready');

  return (
    <section className="project-intro" id={project.id} aria-labelledby={headingId}>
      <div className="project-intro__layout">
        <div className="project-intro__content">
          <h2 className="project-intro__title" id={headingId} ref={titleRef}>
            {project.titleLines.map((line, index) => (
              <span key={`${index}-${line}`}>{line}</span>
            ))}
          </h2>

          <dl className="project-intro__facts">
            {project.facts.map((fact) => (
              <div className="project-intro__fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.values.join('\n')}</dd>
              </div>
            ))}
          </dl>

          <hr className="project-intro__rule" />

          <div className="project-intro__description">
            {project.description.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {project.illustration.status === 'ready' ? (
          <figure className="project-intro__illustration" ref={illustrationRef}>
            <img
              src={`${import.meta.env.BASE_URL}${project.illustration.src}`}
              alt={project.illustration.alt}
              width={935}
              height={999}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : (
          <div
            className="project-intro__illustration project-intro__illustration--missing"
            aria-hidden="true"
          />
        )}

        <footer className="project-intro__footer">
          <p>{project.footer.author}</p>
          <p>{project.footer.project}</p>
        </footer>
      </div>
    </section>
  );
}

export default ProjectIntro;
