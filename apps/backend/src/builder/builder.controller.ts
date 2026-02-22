import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HuggingFaceService } from '../huggingface/huggingface.service';

class SuggestFixDto {
  error!: string;
  code!: string;
  filePath?: string;
}

@ApiTags('builder')
@Controller('builder')
@Public()
export class BuilderController {
  constructor(private readonly huggingFace: HuggingFaceService) {}

  @Post('suggest-fix')
  @ApiOperation({ summary: 'Suggest fix for build/preview error' })
  async suggestFix(@Body() dto: SuggestFixDto): Promise<{ suggestion: string }> {
    const prompt = `You are a React/JS expert. Fix this error:

Error: ${dto.error.slice(0, 500)}

Code:
\`\`\`jsx
${dto.code.slice(0, 2000)}
\`\`\`

Return ONLY the corrected code, no explanation.`;

    try {
      const fixed = await this.huggingFace.generateText(prompt, 1024, 0.2);
      return { suggestion: fixed || dto.code };
    } catch {
      return { suggestion: dto.code };
    }
  }
}
