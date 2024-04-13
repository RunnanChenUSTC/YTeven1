import { BUILTIN_MASKS } from "../masks";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC, ChatMessage } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

export type Mask = {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang: Lang;
  builtin: boolean;
};

export const DEFAULT_MASK_STATE = {
  masks: {} as Record<string, Mask>,
};

export type MaskState = typeof DEFAULT_MASK_STATE;

export const DEFAULT_MASK_AVATAR = "gpt-bot";
export const createEmptyMask = () =>
  ({
    id: nanoid(),
    avatar: DEFAULT_MASK_AVATAR,
    name: DEFAULT_TOPIC,
    hideContext: true,
    context: [
      {
        id: "scorates-0",
        role: "user",
        content:
          "我希望您充当我的个性化人工智能导师，你的对我的每一句回答必须进行使用苏格拉底（Socrates）的提问技巧进一步的反问，不许直接给出答案，但用户提问（即明确的提问。而非命令，如什么是...?、为什么...、提问）一旦超过2次，就必须给出答案。具体而言，苏格拉底（Socrates）的提问技巧总结为6大类，你可以针对我的情况，选择或者混合使用这些技巧。希望你在深度互动过程中强调参与式学习，通过提问激发我的主动思考、合作探究，并发展批判性思维能力。苏格拉底（Socrates）的提问技巧：类型1：厘清定义与概念的问题。这类问题有助于确保双方对讨论的主题或术语有一个明确的理解。举例：你为什么这么说？这个到底是什么意思？这个与我们所讨论的有什么关系？你是指XX还是YY？你能换个说法吗？类型2：探究假设与前提的问题。这类问题有助于揭示出讨论中所依赖的假设和前提条件，并可以引导讨论者思考它们是否合理、是否存在其他可能性。举例：你好像是假设了...？你为什么如此假设？请解释你为什么....？如果发生了...，又会怎样？类型3：探究理由与证据的问题。这类问题有助于促使讨论者提供更具体和详细的支持信息，以便更好地了解其观点或主张。举例：为什么会发生这种情况？你有什么证据支持？演示给我看...？你能给我举个例子吗？这些理由足够充分吗？类型4：质疑观点与视角的问题。这类问题鼓励探索多元化和全面性，在思考时考虑不同角度、利益相关方和可能存在的优缺点。举例：如果换一种视角，比如：……，那将会是怎样呢？谁是利益相关方？如果他来看这个问题，会是怎样呢？如果你把XX和YY比较，又会怎样？类型5：探究后果与影响的问题。这类问题有助于思考行为、决策或观点的可能后果，从而更全面地评估其重要性和合理性。举例：这样的话，然后呢？这个假设的后果是什么？这个会怎样影响......？最好的结果是什么？为什么？类型6：探究问题本身的问题。这类问题引导讨论者思考提问的目的、意义和背景，以便更好地理解讨论的动机和价值。举例：你提的这个问题有什么意义？为什么这么问？你将首先负责对我进行chatgpt使用的初始训练，引导我通过学习操作规则，开展基础对话，熟悉 ChatGPT 的功能界面和使用方式。同时你应该主动发问，了解我的特定背景信息与需求，如学习风格、个人兴趣、沟通类型、对话语气、学习目标等，将自己打造成个性化人工智能导师，使对话内容更具定制化与个性化。一旦你熟悉了我的特定背景信息与需求，我可能任何感兴趣的主题，可以是正在学习的学科，也可以是某个特定领域的知识点，与你进行深度互动。在直接给出我答案之前，请你采用循循善诱的方法，通过不断反问，确认我想了解的问题，帮助我探索自己到底想问什么问题，引导我深入思考。你必须采用苏格拉底（Socrates）的提问技巧帮助我参与式学习，通过提问激发我主动思考、合作探究，并发展批判性思维能力。",
        date: "",
      },
    ],
    syncGlobalConfig: true, // use global config as default
    modelConfig: { ...useAppConfig.getState().modelConfig },
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
  }) as Mask;

export const useMaskStore = createPersistStore(
  { ...DEFAULT_MASK_STATE },

  (set, get) => ({
    create(mask?: Partial<Mask>) {
      const masks = get().masks;
      const id = nanoid();
      masks[id] = {
        ...createEmptyMask(),
        ...mask,
        id,
        builtin: false,
      };

      set(() => ({ masks }));
      get().markUpdate();

      return masks[id];
    },
    updateMask(id: string, updater: (mask: Mask) => void) {
      const masks = get().masks;
      const mask = masks[id];
      if (!mask) return;
      const updateMask = { ...mask };
      updater(updateMask);
      masks[id] = updateMask;
      set(() => ({ masks }));
      get().markUpdate();
    },
    delete(id: string) {
      const masks = get().masks;
      delete masks[id];
      set(() => ({ masks }));
      get().markUpdate();
    },

    get(id?: string) {
      return get().masks[id ?? 1145141919810];
    },
    getAll() {
      const userMasks = Object.values(get().masks).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const config = useAppConfig.getState();
      if (config.hideBuiltinMasks) return userMasks;
      const buildinMasks = BUILTIN_MASKS.map(
        (m) =>
          ({
            ...m,
            modelConfig: {
              ...config.modelConfig,
              ...m.modelConfig,
            },
          }) as Mask,
      );
      return userMasks.concat(buildinMasks);
    },
    search(text: string) {
      return Object.values(get().masks);
    },
  }),
  {
    name: StoreKey.Mask,
    version: 3.1,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as MaskState;

      // migrate mask id to nanoid
      if (version < 3) {
        Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
      }

      if (version < 3.1) {
        const updatedMasks: Record<string, Mask> = {};
        Object.values(newState.masks).forEach((m) => {
          updatedMasks[m.id] = m;
        });
        newState.masks = updatedMasks;
      }

      return newState as any;
    },
  },
);
