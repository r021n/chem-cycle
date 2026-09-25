import React from 'react';

interface ChemFormulaProps {
  formula?: string;
  className?: string;
}

export const ChemFormula: React.FC<ChemFormulaProps> = ({ formula, className }) => {
  if (!formula) return null;

  // Format chemical formula strings like:
  // "CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)"
  // "Delta H = -890.4 kJ/mol"
  // "N2(g) + 3H2(g) <=> 2NH3(g)"
  // "CO3^2-"
  const formatFormula = (raw: string) => {
    // Replace arrows
    let text = raw.replace(/<=>|<->/g, ' ⇌ ').replace(/->|-->/g, ' → ');
    // Replace Delta
    text = text.replace(/Delta\s*H|ΔH/g, 'ΔH');

    // Split words or tokens
    const parts = text.split(/(\s+|⇌|→|\+|-|\(|\))/);

    return parts.map((part, index) => {
      // Check for superscript like ^2- or ^+
      if (part.includes('^')) {
        const [base, sup] = part.split('^');
        return (
          <span key={index}>
            {formatSubscripts(base)}
            <sup>{sup}</sup>
          </span>
        );
      }
      return <React.Fragment key={index}>{formatSubscripts(part)}</React.Fragment>;
    });
  };

  const formatSubscripts = (str: string) => {
    // Matches chemical formulas like H2O, CO2, Fe3O4, CaCO3, etc.
    const regex = /([A-Za-z]+)(\d+)/g;
    const pieces: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        pieces.push(str.substring(lastIndex, match.index));
      }
      pieces.push(match[1]);
      pieces.push(<sub key={match.index} className="text-[0.75em] bottom-[-0.2em]">{match[2]}</sub>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      pieces.push(str.substring(lastIndex));
    }

    return pieces.length > 0 ? pieces : str;
  };

  return (
    <span className={`font-mono inline-block tracking-tight text-chem-forest ${className || ''}`}>
      {formatFormula(formula)}
    </span>
  );
};
