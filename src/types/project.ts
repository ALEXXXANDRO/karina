export interface ProjectFact {
  readonly label: string;
  readonly values: readonly string[];
}

type ProjectIllustration =
  | { readonly status: 'missing' }
  | {
    readonly status: 'ready';
    /** A local public asset path, relative to the deployment base. */
    readonly src: `assets/${string}`;
    readonly alt: string;
  };

export interface ProjectIntroData {
  readonly id: string;
  readonly titleLines: readonly [string, ...string[]];
  readonly facts: readonly [ProjectFact, ProjectFact, ProjectFact];
  readonly description: {
    readonly status: 'confirmed' | 'unconfirmed-reference-copy';
    readonly paragraphs: readonly string[];
  };
  readonly illustration: ProjectIllustration;
  readonly footer: {
    readonly author: string;
    readonly project: string;
  };
}
